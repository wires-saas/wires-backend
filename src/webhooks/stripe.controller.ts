import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { StripeWebhookEventDto } from './dto/stripe-webhook-event.dto';
import { WebhookEvent } from './schemas/webhook-event.schema';
import { StripeWebhookEventType } from './entities/webhook.entities';
import { OrganizationPlansService } from '../organizations/organization-plans.service';
import { PlanType } from '../organizations/entities/plan-type.entity';
import { EmailService } from '../services/email/email.service';
import { OrganizationPlan } from '../organizations/schemas/organization-plan.schema';
import { OrganizationsService } from '../organizations/organizations.service';
import { PlanStatus } from '../organizations/entities/plan-status.entity';
import { randomId } from '../shared/utils/db.utils';

@Controller('webhooks/stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly organizationsService: OrganizationsService,
    private readonly organizationPlansService: OrganizationPlansService,
    private readonly emailService: EmailService,
  ) {}

  private validatePlanType(planType: string): PlanType {
    if (
      !(
        [PlanType.BASIC, PlanType.EXTENDED, PlanType.CUSTOM] as string[]
      ).includes(planType)
    ) {
      this.logger.error(
        'Invalid plan nickname received, cannot map it to plan type',
      );
      throw new BadRequestException('Invalid plan nickname');
    }
    return planType as PlanType;
  }

  @Post()
  async handleEvent(
    @Body() webhookEvent: StripeWebhookEventDto,
  ): Promise<WebhookEvent> {
    this.logger.log('Received webhook event of type ' + webhookEvent.type);

    const event: WebhookEvent =
      await this.webhooksService.createStripeEvent(webhookEvent);

    // Workflow for handling Stripe events
    // Relevant events:
    // Customer - keep customer email sync
    // Invoice - activate plan, send creation email if relevant
    // Checkout - attach plan to known organization

    // Important: as webhook event reception is not in a guaranteed order
    // we tried to make the code as idempotent as possible (createOrUpdate)

    if (event.type === StripeWebhookEventType.INVOICE_PAYMENT_SUCCEEDED) {
      // Fetching all relevant data from the event
      const subscriptionId = event.data.object.subscription;
      const customerId = event.data.object.customer;
      const customerEmail = event.data.object.customer_email;
      const planType = this.validatePlanType(
        event.data.object.lines.data[0].plan.nickname,
      );
      const periodStart = event.data.object.lines.data[0].period.start * 1000;
      const periodEnd = event.data.object.lines.data[0].period.end * 1000;
      const nbDays = (periodEnd - periodStart) / (1000 * 60 * 60 * 24);
      const lastInvoice = event.data.object.hosted_invoice_url;
      const planStatus =
        event.data.object.status === 'paid'
          ? PlanStatus.ACTIVE
          : PlanStatus.INCOMPLETE;

      this.logger.log('Invoice payment covers ' + nbDays + ' days');

      const plan: OrganizationPlan =
        await this.organizationPlansService.findOneBySubscriptionId(
          subscriptionId,
        );

      const organizationCreation = !plan || !plan.organization;

      const isTrial = !plan && nbDays < 15;

      if (organizationCreation) {
        this.logger.log('Creating new organization plan with creation token');

        const creationToken = randomId();

        if (isTrial) {
          await this.organizationPlansService.createOrUpdate({
            type: planType,
            subscriptionId: subscriptionId,
            customerId: customerId,
            customerEmail: customerEmail,
            status: planStatus,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            trialEnd: periodEnd,
            organizationCreationToken: creationToken,
            lastInvoice: lastInvoice,
          });
        } else {
          await this.organizationPlansService.createOrUpdate({
            type: planType,
            subscriptionId: subscriptionId,
            customerId: customerId,
            customerEmail: customerEmail,
            status: planStatus,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            trialEnd: 0,
            organizationCreationToken: creationToken,
            lastInvoice: lastInvoice,
          });
        }

        this.logger.log(
          'Sending organization creation email to customer ' + customerId,
        );
        await this.emailService.sendOrganizationCreationEmail(
          customerEmail,
          creationToken,
          planType,
        );
      } else {
        this.logger.log('Updating existing organization plan');
        await this.organizationPlansService.createOrUpdate({
          type: planType,
          organization: plan.organization,
          subscriptionId: subscriptionId,
          customerId: customerId,
          customerEmail: customerEmail,
          status: planStatus,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          trialEnd: 0,
          organizationCreationToken: plan.organizationCreationToken,
          lastInvoice: lastInvoice,
        });

        // TODO notification email
      }
    } else if (
      event.type === StripeWebhookEventType.CUSTOMER_CREATED ||
      event.type === StripeWebhookEventType.CUSTOMER_UPDATED
    ) {
      this.logger.log(
        'Updating customer email for customer ' + event.data.object.id,
      );
      await this.organizationPlansService.updateCustomerEmail(
        event.data.object.id,
        event.data.object.email,
      );
    } else if (
      event.type === StripeWebhookEventType.CHECKOUT_SESSION_COMPLETED
    ) {
      // Checkout session completion event is the only event that contains the organization slug
      // (we provide it under client_reference_id)
      this.logger.log('Trying to affect plan to existing organization');

      const subscriptionId = event.data.object.subscription;
      const organizationSlug = event.data.object.client_reference_id;

      if (organizationSlug) {
        const organization =
          await this.organizationsService.findOne(organizationSlug);

        if (!organization) {
          this.logger.error(
            'Organization not found for slug ' + organizationSlug,
          );
          throw new NotFoundException(
            'Client reference does not match any organization slug',
          );
        }

        this.logger.log('Setting organization field of plan');
        const planPostUpdate =
          await this.organizationPlansService.createOrUpdate({
            subscriptionId,
            organization: organization._id,
          });

        if (planPostUpdate._id !== organization.plan) {
          this.logger.log('Setting plan field of organization');
          await this.organizationsService.updatePlan(
            organizationSlug,
            planPostUpdate._id,
          );
        }
      } else {
        this.logger.log('No organization slug found in event, ignoring');
      }
    } else if (
      event.type === StripeWebhookEventType.CUSTOMER_SUBSCRIPTION_UPDATED
    ) {
      // Multiple things can happen here:
      // - Plan is cancelled
      // - Plan is upgraded/downgraded
      // - Trial period ends and is converted
      // - Plan is renewed

      const plan = await this.organizationPlansService.findOneBySubscriptionId(
        event.data.object.id,
      );

      if (!plan) {
        this.logger.warn('No plan found for subscription, ignoring event');
        throw new NotFoundException('No plan found for subscription');
      } else {
        if (event.data.object.canceled_at) {
          this.logger.log(
            'Cancelling plan for subscription ' + plan.subscriptionId,
          );
          await this.organizationPlansService.cancel(
            plan.subscriptionId,
            event.data.object.cancel_at * 1000,
          );
        } else if (
          event.data.previous_attributes.status === 'trialing' &&
          event.data.object.status === 'active'
        ) {
          this.logger.log(
            'Converting trial to paid plan for subscription ' +
              plan.subscriptionId,
          );
          await this.organizationPlansService.convertFreeTrial(
            plan.subscriptionId,
            event.data.object.current_period_start * 1000,
            event.data.object.current_period_end * 1000,
          );
        } else if (
          event.data.previous_attributes.current_period_end &&
          event.data.previous_attributes.current_period_start
        ) {
          this.logger.log(
            'Renewing plan for subscription ' + plan.subscriptionId,
          );
          await this.organizationPlansService.renew(
            plan.subscriptionId,
            event.data.object.current_period_start * 1000,
            event.data.object.current_period_end * 1000,
          );
        }
      }
    } else if (
      event.type === StripeWebhookEventType.CUSTOMER_SUBSCRIPTION_DELETED
    ) {
      const plan = await this.organizationPlansService.findOneBySubscriptionId(
        event.data.object.id,
      );

      if (!plan) {
        this.logger.warn(
          'No plan found for subscription deletion, ignoring event',
        );
      } else {
        this.logger.log(
          'Expiring plan for subscription ' + plan.subscriptionId,
        );
        await this.organizationPlansService.expire(plan.subscriptionId);
      }
    }

    return event;
  }

  @Get()
  findAll(): Promise<WebhookEvent[]> {
    return this.webhooksService.findAll();
  }
}

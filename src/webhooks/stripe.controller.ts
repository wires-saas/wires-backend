import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
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
  async create(
    @Body() webhookEvent: StripeWebhookEventDto,
  ): Promise<WebhookEvent> {
    this.logger.log('Received webhook event of type ' + webhookEvent.type);

    const event: WebhookEvent =
      await this.webhooksService.createStripeEvent(webhookEvent);

    // Workflow for handling Stripe events

    if (event.type === StripeWebhookEventType.CUSTOMER_SUBSCRIPTION_CREATED) {
      // To create plan on subscription creation

      const plan = await this.organizationPlansService.findOneBySubscriptionId(
        event.data.object.id,
      );

      const planType = this.validatePlanType(event.data.object.plan.nickname);

      if (!plan) {
        this.logger.log('Creating new organization plan for subscription');
        await this.organizationPlansService.create(
          planType,
          event.data.object.id,
          event.data.object.customer,
          event.data.object.current_period_start * 1000,
          event.data.object.current_period_end * 1000,
          event.data.object.trial_end ? event.data.object.trial_end * 1000 : 0,
          true,
        );
      } else {
        this.logger.error('Plan already exists for subscription');
        throw new ForbiddenException('Plan already exists');
      }
    } else if (
      event.type === StripeWebhookEventType.INVOICE_PAYMENT_SUCCEEDED
    ) {
      // To ensure plan is activated when payment is successful
      let plan: OrganizationPlan =
        await this.organizationPlansService.findOneBySubscriptionId(
          event.data.object.subscription,
        );

      if (!plan) {
        // 7 sec retry to handle Stripe webhooks random order
        this.logger.log('Plan not found, retrying in 7 seconds');
        plan = await new Promise((resolve) =>
          setTimeout(() => {
            resolve(
              this.organizationPlansService.findOneBySubscriptionId(
                event.data.object.subscription,
              ),
            );
          }, 7000),
        );
      }

      if (plan) {
        if (event.data.object.status === 'paid') {
          this.logger.log(
            'Activating plan for subscription ' + plan.subscriptionId,
          );
          await this.organizationPlansService.activate(plan.subscriptionId);

          this.logger.log(
            'Syncing customer email for customer ' + event.data.object.customer,
          );
          await this.organizationPlansService.updateCustomerEmail(
            event.data.object.customer,
            event.data.object.customer_email,
          );

          if (event.data.object.hosted_invoice_url) {
            // TODO send email with invoice ? or Stripe does it ?
            this.logger.log('Sending invoice email to customer');
            await this.organizationPlansService.updateLastInvoice(
              plan.subscriptionId,
              event.data.object.hosted_invoice_url,
            );
          }

          const eventPlanType = this.validatePlanType(
            event.data.object.lines.data[0].plan.nickname,
          );

          if (plan.type !== eventPlanType) {
            this.logger.log(
              'Switching plan type from ' +
                plan.type +
                ' to ' +
                eventPlanType +
                ' for subscription ' +
                plan.subscriptionId,
            );
            await this.organizationPlansService.updatePlanType(
              plan.subscriptionId,
              eventPlanType,
            );
          }

          // Send email to user
          if (!plan.organization) {
            this.logger.log('Sending organization creation email to customer');
            await this.emailService.sendOrganizationCreationEmail(
              plan.customerId,
              event.data.object.customer_email,
              plan.organizationCreationToken,
              plan.type,
            );
          }
        }
      } else {
        this.logger.error('No plan found for subscription');
        throw new NotFoundException('No plan found for subscription');
        // Stripe will retry webhook event
      }
    } else if (
      event.type === StripeWebhookEventType.CUSTOMER_CREATED ||
      event.type === StripeWebhookEventType.CUSTOMER_UPDATED
    ) {
      // To keep customer email up-to-date
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

      if (!organizationSlug) {
        this.logger.warn('No client reference id found in event data');
        throw new NotFoundException(
          'No client reference id found in event data',
        );
      }

      const organization =
        await this.organizationsService.findOne(organizationSlug);
      if (!organization) {
        this.logger.error(
          'Organization not found for slug ' + organizationSlug,
        );
        throw new NotFoundException(
          'Organization not found for slug ' + organizationSlug,
        );
      }

      let plan: OrganizationPlan =
        await this.organizationPlansService.findOneBySubscriptionId(
          subscriptionId,
        );

      if (!plan) {
        // wait 7 seconds to handle Stripe webhooks random order
        await new Promise((resolve) => setTimeout(resolve, 7000));
        plan =
          await this.organizationPlansService.findOneBySubscriptionId(
            subscriptionId,
          );
      }

      if (!plan) {
        this.logger.error('No plan found for subscription');
        throw new NotFoundException('No plan found for subscription');
      }

      this.logger.log(
        'Syncing organization plan for organization ' + organizationSlug,
      );
      await this.organizationPlansService.updateOrganization(
        subscriptionId,
        organizationSlug,
      );

      await this.organizationsService.updatePlan(organizationSlug, plan._id);
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
    }

    return event;
  }

  @Get()
  findAll(): Promise<WebhookEvent[]> {
    return this.webhooksService.findAll();
  }
}

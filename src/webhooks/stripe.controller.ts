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

@Controller('webhooks/stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private readonly webhooksService: WebhooksService,
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
      const plan = await this.organizationPlansService.findOneBySubscriptionId(
        event.data.object.subscription,
      );

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

          // Send email to user
          await this.emailService.sendOrganizationCreationEmail(
            plan.customerId,
            event.data.object.customer_email,
            plan.organizationCreationToken,
            plan.type,
          );
        }
      } else {
        this.logger.error('No plan found for subscription');
        throw new NotFoundException('No plan found for subscription');
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

      const subscriptionId = event.data.object.subscription;
      const organizationSlug = event.data.object.client_reference_id;
      if (!organizationSlug) {
        this.logger.warn('No client reference id found in event data');

        await this.organizationPlansService.updateCustomerEmail(
          event.data.object.customer,
          event.data.object.customer_details.email,
        );
      } else {
        this.logger.log(
          'Updating organization plan for organization ' + organizationSlug,
        );
        await this.organizationPlansService.updateOrganization(
          subscriptionId,
          organizationSlug,
        );
      }
    } else if (
      event.type === StripeWebhookEventType.CUSTOMER_SUBSCRIPTION_UPDATED
    ) {
      // Multiple things can happen here:
      // - Plan is cancelled
      // - Plan is upgraded/downgraded

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

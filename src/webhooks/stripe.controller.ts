import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { StripeWebhookEventDto } from './dto/stripe-webhook-event.dto';
import { WebhookEvent } from './schemas/webhook-event.schema';
import { StripeWebhookEventType } from './entities/webhook.entities';
import { OrganizationPlansService } from '../organizations/organization-plans.service';
import { PlanType } from '../organizations/entities/plan-type.entity';
import { PlanStatus } from '../organizations/entities/plan-status.entity';

@Controller('webhooks/stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly organizationPlansService: OrganizationPlansService,
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

    if (event.type === StripeWebhookEventType.CUSTOMER_SUBSCRIPTION_CREATED) {
      const plan = await this.organizationPlansService.findOneBySubscriptionId(
        event.data.object.id,
      );

      const planType = this.validatePlanType(event.data.object.plan.nickname);

      if (!plan) {
        this.logger.log('Creating new organization plan');
        await this.organizationPlansService.create(
          planType,
          event.data.object.id,
          event.data.object.customer,
          event.data.object.current_period_start * 1000,
          event.data.object.current_period_end * 1000,
        );
      } else {
        this.logger.warn(
          'Plan already exists for subscription, ignoring event',
        );
      }
    } else if (
      event.type === StripeWebhookEventType.INVOICE_PAYMENT_SUCCEEDED
    ) {
      const planType = this.validatePlanType(
        event.data.object.lines.data[0].plan.nickname,
      );

      this.logger.log('Updating organization plan based on invoice event data');
      await this.organizationPlansService.createOrUpdate(
        planType,
        event.data.object.subscription,
        event.data.object.customer,
        event.data.object.period_start * 1000,
        event.data.object.period_end * 1000,
        event.data.object.status === 'paid'
          ? PlanStatus.ACTIVE
          : PlanStatus.INCOMPLETE,
      );
    }

    return event;
  }

  @Get()
  findAll(): Promise<WebhookEvent[]> {
    return this.webhooksService.findAll();
  }
}

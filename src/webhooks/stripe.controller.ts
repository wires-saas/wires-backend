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

@Controller('webhooks/stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly organizationPlansService: OrganizationPlansService,
  ) {}

  @Post()
  async create(
    @Body() webhookEvent: StripeWebhookEventDto,
  ): Promise<WebhookEvent> {
    this.logger.log('Received webhook event');
    this.logger.log(JSON.stringify(webhookEvent));
    const event: WebhookEvent =
      await this.webhooksService.createStripeEvent(webhookEvent);

    if (event.type === StripeWebhookEventType.CUSTOMER_SUBSCRIPTION_CREATED) {
      this.logger.log('New subscription, creating organization plan');

      const plan = await this.organizationPlansService.findOneBySubscriptionId(
        event.data.id,
      );

      const planType = event.data.plan.nickname as PlanType;

      if (!plan) {
        if (
          ![PlanType.BASIC, PlanType.EXTENDED, PlanType.CUSTOM].includes(
            planType,
          )
        ) {
          this.logger.error(
            'Invalid plan nickname received, cannot map it to plan type',
          );
          throw new BadRequestException('Invalid plan nickname');
        }

        await this.organizationPlansService.create(
          planType,
          event.data.customer,
          event.data.id,
        );
      } else {
        this.logger.warn(
          'Plan already exists for subscription, ignoring event',
        );
      }
    }

    return event;
  }

  @Get()
  findAll(): Promise<WebhookEvent[]> {
    return this.webhooksService.findAll();
  }
}

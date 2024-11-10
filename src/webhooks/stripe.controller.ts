import { Controller, Post, Body, Logger, Get } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { StripeWebhookEventDto } from './dto/stripe-webhook-event.dto';
import { WebhookEvent } from './schemas/webhook-event.schema';

@Controller('webhooks/stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  create(@Body() webhookEvent: StripeWebhookEventDto): Promise<WebhookEvent> {
    this.logger.log('Received webhook event');
    this.logger.log(JSON.stringify(webhookEvent));
    return this.webhooksService.createStripeEvent(webhookEvent);
  }

  @Get()
  findAll(): Promise<WebhookEvent[]> {
    return this.webhooksService.findAll();
  }
}

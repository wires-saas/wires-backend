import { Controller, Post, Body, Logger } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks/stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  create(@Body() webhookEvent: any) {
    this.logger.log('Received webhook event');
    this.logger.log(JSON.stringify(webhookEvent));
    // return this.webhooksService.create(webhookEvent);
  }
}

import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { StripeController } from './stripe.controller';

@Module({
  controllers: [StripeController],
  providers: [WebhooksService],
})
export class WebhooksModule {}

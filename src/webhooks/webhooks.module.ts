import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { StripeController } from './stripe.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WebhookEventColl,
  WebhookEventSchema,
} from './schemas/webhook-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WebhookEventColl, schema: WebhookEventSchema },
    ]),
  ],
  controllers: [StripeController],
  providers: [WebhooksService],
})
export class WebhooksModule {}

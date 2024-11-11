import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { StripeController } from './stripe.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WebhookEventColl,
  WebhookEventSchema,
} from './schemas/webhook-event.schema';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WebhookEventColl, schema: WebhookEventSchema },
    ]),
    OrganizationsModule,
  ],
  controllers: [StripeController],
  providers: [WebhooksService],
})
export class WebhooksModule {}

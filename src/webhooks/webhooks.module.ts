import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { StripeController } from './stripe.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WebhookEventColl,
  WebhookEventSchema,
} from './schemas/webhook-event.schema';
import { OrganizationsModule } from '../organizations/organizations.module';
import { EmailModule } from '../services/email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WebhookEventColl, schema: WebhookEventSchema },
    ]),
    OrganizationsModule,
    EmailModule,
  ],
  controllers: [StripeController],
  providers: [WebhooksService],
})
export class WebhooksModule {}

import { Injectable } from '@nestjs/common';
import { StripeWebhookEventDto } from './dto/stripe-webhook-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebhookEvent, WebhookEventColl } from './schemas/webhook-event.schema';
import { randomId } from '../shared/utils/db.utils';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectModel(WebhookEventColl)
    private webhookEventModel: Model<WebhookEvent>,
  ) {}

  createStripeEvent(createWebhookDto: StripeWebhookEventDto) {
    return new this.webhookEventModel(
      new WebhookEvent({
        _id: randomId(),
        emittedAt: createWebhookDto.created * 1000, // Stripe returns seconds
        type: createWebhookDto.type,
        data: createWebhookDto.data,
        externalId: createWebhookDto.id,
      }),
    ).save();
  }

  findAll(): Promise<WebhookEvent[]> {
    return this.webhookEventModel.find().exec();
  }
}

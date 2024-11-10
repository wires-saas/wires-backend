import { HydratedDocument, SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { StripeWebhookEventType } from '../entities/webhook.entities';

export type WebhookEventDocument = HydratedDocument<WebhookEvent>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class WebhookEvent {
  @Prop({ type: String })
  _id: string;

  @Prop({ type: String, enum: StripeWebhookEventType })
  type: StripeWebhookEventType;

  @Prop({ type: Number })
  emittedAt: number;

  @Prop({ type: String })
  externalId: string;

  @Prop({ required: true, type: SchemaTypes.Mixed })
  data: any;

  constructor(partial: Partial<WebhookEvent>) {
    Object.assign(this, partial);
  }
}

export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent);

export const WebhookEventColl = 'webhook_events';

import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ProviderId } from './provider-id.schema';
import { ProviderType } from '../entities/provider.entities';

export type ProviderDocument = HydratedDocument<Provider>;

// Using virtuals to explode compound _id into separate fields

@Schema({
  discriminatorKey: 'type',
})
export class Provider {
  @Prop({ type: ProviderId })
  _id: ProviderId;

  @Prop({ type: String })
  displayName: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, enum: ProviderType, required: true })
  type: ProviderType;

  // virtuals
  id: string;
  organization: string;

  constructor(partial: Partial<Provider>) {
    Object.assign(this, partial);
  }
}

export const ProviderSchema = SchemaFactory.createForClass(Provider);

import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ProviderId } from '../../schemas/provider-id.schema';
import { Authentication } from '../../../shared/schemas/authentication.schema';
import { ProviderType } from '../../entities/provider.entities';
import { SupportedEmailsProvider } from '../entities/emails-provider.entities';

export type EmailsProviderDocument = HydratedDocument<EmailsProvider>;

// Using virtuals to explode compound _id into separate fields

@Schema({
  id: true,
  virtuals: {
    id: {
      get() {
        return this._id.provider;
      },
    },
    organization: {
      get() {
        return this._id.organization;
      },
    },
  },
  toObject: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      return ret;
    },
    virtuals: true,
  },
  toJSON: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      delete ret._id;
      ret.type = ret.implementation;
      delete ret.implementation;

      return ret;
    },
    virtuals: true,
    versionKey: false,
  },
})
export class EmailsProvider {
  _id: ProviderId;
  type: ProviderType;
  displayName: string;
  description: string;

  @Prop({
    type: String,
    enum: SupportedEmailsProvider,
    required: true,
  })
  implementation: SupportedEmailsProvider;

  @Prop({ type: Authentication, required: true })
  authentication: Authentication;

  @Prop({ type: Boolean, default: false })
  isDefault: boolean; // implicitly used for organization

  @Prop({ type: Boolean, default: false })
  isVerified: boolean; // authentication verified

  // virtuals
  id: string;
  organization: string;

  // cannot be made abstract because of schema generation
  getSenderDomains(): Promise<any> {
    // implementation specific logic
    throw new Error('Method not implemented');
  }

  constructor(partial: Partial<EmailsProvider>) {
    Object.assign(this, partial);
  }
}

export const EmailsProviderSchema =
  SchemaFactory.createForClass(EmailsProvider);

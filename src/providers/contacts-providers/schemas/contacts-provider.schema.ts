import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ProviderId } from '../../schemas/provider-id.schema';
import { Authentication } from '../../../shared/schemas/authentication.schema';
import { SupportedContactsProvider } from '../entities/contacts-provider.entities';
import { ProviderType } from '../../entities/provider.entities';

export type ContactsProviderDocument = HydratedDocument<ContactsProvider>;

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
export class ContactsProvider {
  _id: ProviderId;
  type: ProviderType;
  displayName: string;
  description: string;

  @Prop({
    type: String,
    enum: SupportedContactsProvider,
    required: true,
  })
  implementation: SupportedContactsProvider;

  @Prop({ type: Authentication, required: true })
  authentication: Authentication;

  @Prop({ type: Boolean, default: false })
  isDefault: boolean; // implicitly used for organization

  @Prop({ type: Boolean, default: false })
  isVerified: boolean; // authentication verified

  @Prop({ type: Boolean, default: false })
  externallyManaged: boolean; // restrain features to GET requests

  // virtuals
  id: string;
  organization: string;

  async getContacts(): Promise<Array<any>> {
    // implementation specific logic
    throw new Error('Method not implemented');
  }

  getContactsCount(): Promise<number> {
    // implementation specific logic
    throw new Error('Method not implemented');
  }

  getContactSchema(): Promise<any> {
    // implementation specific logic
    throw new Error('Method not implemented');
  }

  constructor(partial: Partial<ContactsProvider>) {
    Object.assign(this, partial);
  }
}

export const ContactsProviderSchema =
  SchemaFactory.createForClass(ContactsProvider);

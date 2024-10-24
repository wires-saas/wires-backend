import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ProviderId } from '../../schemas/provider-id.schema';

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
      delete ret.description;
      ret.abc = 'def';
      return ret;
    },
    virtuals: true,
  },
})
export class ContactsProvider {
  _id: ProviderId;
  displayName: string;
  description: string;

  @Prop({ type: String, required: true })
  test: string;

  // virtuals
  id: string;
  organization: string;

  constructor(partial: Partial<ContactsProvider>) {
    Object.assign(this, partial);
  }
}

export const ContactsProviderSchema =
  SchemaFactory.createForClass(ContactsProvider);

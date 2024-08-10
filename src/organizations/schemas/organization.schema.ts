import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../../users/schemas/user.schema';

export type OrganizationDocument = HydratedDocument<Organization>;

@Schema({
  timestamps: true,
  toObject: {
    //delete __v from output object
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      ret.slug = ret._id;
      delete ret._id;
      return ret;
    },
  },
  toJSON: {
    //delete __v from output JSON
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      ret.slug = ret._id;
      delete ret._id;
      return ret;
    },
  },
})
export class Organization {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true }) // not specify it will throw, resulting in error 500
  name: string;

  @Prop({ default: '' })
  legalName: string;

  slug: string;

  @Prop({ default: '' })
  logo: string;

  @Prop({ default: '' })
  activity: string;

  @Prop({ default: '' })
  website: string;

  @Prop({ default: '' })
  legalId: string;

  @Prop(
    raw({
      street: { type: String },
      city: { type: String },
      zip: { type: String },
      country: { type: String },
    }),
  )
  address: Record<string, string>;

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  adminContact: User;

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  billingContact: User;

  @Prop(
    raw({
      twoFactorAuthenticationEnabled: { type: Boolean, default: false },
      twoFactorAuthenticationMethods: { type: [String], default: [] },
    }),
  )
  security: Record<string, unknown>;

  @Prop(
    raw({
      type: { type: String, default: 'free' },
      willExpireAt: { type: Date },
    }),
  )
  subscription: Record<string, unknown>; // TODO subscription type

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  constructor(partial: Partial<Organization>) {
    Object.assign(this, partial);
  }
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

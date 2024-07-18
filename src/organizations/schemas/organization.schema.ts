import { HydratedDocument } from 'mongoose';
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';

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

  @Prop()
  logo: string;

  @Prop()
  activity: string;

  @Prop(
    raw({
      street: { type: String },
      city: { type: String },
      zip: { type: String },
      country: { type: String },
    }),
  )
  address: Record<string, string>;

  @Prop(
    raw({
      firstName: { type: String },
      lastName: { type: String },
      email: { type: String },
    }),
  )
  adminContact: Record<string, string>;

  @Prop(
    raw({
      firstName: { type: String },
      lastName: { type: String },
      email: { type: String },
    }),
  )
  billingContact: Record<string, string>;

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
  subscription: Record<string, unknown>;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  constructor(partial: Partial<Organization>) {
    Object.assign(this, partial);
  }
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

import { HydratedDocument } from 'mongoose';
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';

export type OrganizationDocument = HydratedDocument<Organization>;

export interface Contact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  consent: boolean;
}

@Schema({
  timestamps: true,
  toObject: {
    //delete __v from output object
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      ret.slug = ret._id;
      delete ret._id;
      delete ret.plan;
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
      delete ret.plan;
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
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      zip: { type: String, default: '' },
      country: { type: String, default: '' },
    }),
  )
  address: Record<string, string>;

  @Prop(
    raw({
      firstName: { type: String },
      lastName: { type: String },
      email: { type: String },
      phone: { type: String },
      consent: { type: Boolean, default: false },
    }),
  )
  adminContact: Contact;

  @Prop(
    raw({
      firstName: { type: String },
      lastName: { type: String },
      email: { type: String },
      phone: { type: String },
      consent: { type: Boolean, default: false },
    }),
  )
  billingContact: Contact;

  @Prop(
    raw({
      twoFactorAuthenticationEnabled: { type: Boolean, default: false },
      twoFactorAuthenticationMethods: { type: [String], default: [] },
    }),
  )
  security: Record<string, unknown>;

  // if type is not String but OrganizationPlan, it will apply the schema
  // hence requiring a populated OrganizationPlan
  @Prop({ required: false, type: String, ref: 'OrganizationPlan' })
  plan: string;

  @Prop({
    required: false,
    type: String,
    ref: 'Gpt',
  })
  gpt?: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  constructor(partial: Partial<Organization>) {
    Object.assign(this, partial);
  }
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

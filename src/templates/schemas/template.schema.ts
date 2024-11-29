import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TemplateId } from './template-id.schema';

export type TemplateDocument = HydratedDocument<Template>;

// Using virtuals to explode compound _id into separate fields

@Schema({
  timestamps: true,
  versionKey: false,
  id: true,
  virtuals: {
    id: {
      get() {
        return this._id.template;
      },
    },
    organization: {
      get() {
        return this._id.organization;
      },
    },
    version: {
      get() {
        return this._id.timestamp;
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
      return ret;
    },
    virtuals: true,
  },
})
export class Template {
  @Prop({ type: TemplateId })
  _id: TemplateId;

  @Prop({ type: String })
  displayName: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: Boolean, required: true })
  isArchived: boolean;

  // virtuals
  id: string;
  organization: string;
  version: number;

  constructor(partial: Partial<Template>) {
    Object.assign(this, partial);
  }
}

export const TemplateSchema = SchemaFactory.createForClass(Template);

import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TagRule } from './tag-rule.schema';

export type TagDocument = HydratedDocument<Tag>;

@Schema({
  timestamps: true,
  toObject: {
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      return ret;
    },
  },
  toJSON: {
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      return ret;
    },
  },
})
export class Tag {
  _id: string;

  @Prop({ required: true, type: String })
  displayName: string;

  @Prop({ required: true, default: '', type: String })
  color: string;

  @Prop({ type: String })
  description: string;

  @Prop({
    required: true,
    type: String,
    ref: 'Organization',
  })
  organization: string;

  @Prop({ type: [TagRule] })
  ruleset: TagRule[];

  constructor(partial: Partial<Tag>) {
    Object.assign(this, partial);
  }
}

export const TagSchema = SchemaFactory.createForClass(Tag);

TagSchema.index({ organization: 1, displayName: 1 }, { unique: true });

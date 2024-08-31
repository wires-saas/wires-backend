import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TagFilter } from './tag-filter.schema';
import { HydratedDocument } from 'mongoose';

export type TagRuleDocument = HydratedDocument<TagRule>;

@Schema({
  timestamps: false,
  versionKey: false,
  _id: false,
})
export class TagRule {
  @Prop({ type: String, required: true })
  field: string;

  @Prop({ type: String, required: true })
  operator: string;

  @Prop({ type: [TagFilter], required: true })
  filters: TagFilter[];

  constructor(partial: Partial<TagRule>) {
    Object.assign(this, partial);
  }
}

export const TagRuleSchema = SchemaFactory.createForClass(TagRule);

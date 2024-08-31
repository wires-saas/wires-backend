import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum FilterMatchMode {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'notContains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  GREATER_THAN = 'greaterThan',
  LESS_THAN = 'lessThan',
  IN = 'in',
}

export type TagFilterDocument = HydratedDocument<TagFilter>;

@Schema({
  timestamps: false,
  versionKey: false,
  _id: false,
})
export class TagFilter {
  @Prop({ type: String })
  filterValue: string | boolean | number;

  @Prop({ type: String })
  filterType: string;

  constructor(partial: Partial<TagFilter>) {
    Object.assign(this, partial);
  }
}

export const TagFilterSchema = SchemaFactory.createForClass(TagFilter);

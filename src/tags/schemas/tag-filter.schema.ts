import { Prop, Schema } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export enum FilterMatchMode {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'notContains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  DATE_IS = 'dateIs',
  DATE_IS_NOT = 'dateIsNot',
  DATE_BEFORE = 'dateBefore',
  DATE_AFTER = 'dateAfter',

  // To verify
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
  @Prop({ type: SchemaTypes.Mixed })
  filterValue: string | boolean | number;

  @Prop({ type: String })
  filterType: FilterMatchMode;

  constructor(partial: Partial<TagFilter>) {
    Object.assign(this, partial);
  }
}

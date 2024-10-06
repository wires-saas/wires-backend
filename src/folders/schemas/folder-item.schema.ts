import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FolderItemId } from './folder-item-id.schema';
import { FolderItemType } from '../entities/folder-item-type';

export type FolderItemDocument = HydratedDocument<FolderItem>;

// Represents an association between a folder and an item
// To avoid "folder" attribute on items

@Schema({
  timestamps: true,
  versionKey: false,
  id: false,
  virtuals: {
    organization: {
      get() {
        return this._id.organization;
      },
    },
    folder: {
      get() {
        return this._id.folder;
      },
    },
    item: {
      get() {
        return this._id.item;
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
export class FolderItem {
  @Prop({ type: FolderItemId })
  _id: FolderItemId;

  @Prop({ type: String })
  type: FolderItemType;

  // virtuals
  id: string;
  organization: string;
  folder: string;
  item: string;

  constructor(partial: Partial<FolderItem>) {
    Object.assign(this, partial);
  }
}

export const FolderItemSchema = SchemaFactory.createForClass(FolderItem);
export const FolderItemColl = 'folder_items';

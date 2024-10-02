import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FolderId } from './folder-id.schema';

export type FolderDocument = HydratedDocument<Folder>;

// Using virtuals to explode compound _id into separate fields

@Schema({
  timestamps: true,
  versionKey: false,
  id: true,
  virtuals: {
    id: {
      get() {
        return this._id.folder;
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
      return ret;
    },
    virtuals: true,
  },
})
export class Folder {
  @Prop({ type: FolderId })
  _id: FolderId;

  @Prop({ type: String })
  displayName: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, default: null })
  parentFolder: string;

  // virtuals
  id: string;
  organization: string;

  constructor(partial: Partial<Folder>) {
    Object.assign(this, partial);
  }
}

export const FolderSchema = SchemaFactory.createForClass(Folder);

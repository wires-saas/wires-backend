import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ResourceId } from './resource-id.schema';
import { ResourceType } from '../entities/resource-type';

export type ResourceDocument = HydratedDocument<Resource>;

// Represents an association between a resource and a folder
// To avoid "folder" attribute on resources

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
    resource: {
      get() {
        return this._id.resource;
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
export class Resource {
  @Prop({ type: ResourceId })
  _id: ResourceId;

  @Prop({ type: String })
  type: ResourceType;

  // virtuals
  id: string;
  organization: string;
  folder: string;
  resource: string;

  constructor(partial: Partial<Resource>) {
    Object.assign(this, partial);
  }
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);

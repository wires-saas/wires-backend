import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Permission } from '../../permissions/schemas/permission.schema';
import { RoleId } from './role-id.schema';

export type RoleDocument = HydratedDocument<Role>;

@Schema({
  timestamps: true,
  id: false,
  virtuals: {
    name: {
      get() {
        return this._id.role;
      },
    },
    organization: {
      get() {
        return this._id.organization;
      },
    },
  },
  toObject: {
    //delete __v from output object
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      // delete ret.password;
      delete ret.updatedAt;
      delete ret.createdAt;
      return ret;
    },
    virtuals: true,
  },
  toJSON: {
    //delete __v from output JSON
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      delete ret._id;
      delete ret.updatedAt;
      delete ret.createdAt;
      return ret;
    },
    virtuals: true,
  },
})
export class Role {
  @Prop({ type: RoleId })
  _id: RoleId;

  @Prop({ type: [String], ref: 'Permission' })
  permissions: Permission[];

  // virtuals
  name: string;
  organization: string;

  constructor(partial: Partial<Role>) {
    Object.assign(this, partial);
  }
}

export const RoleSchema = SchemaFactory.createForClass(Role);

import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Permission } from '../../permissions/schemas/permission.schema';

export type RoleDocument = HydratedDocument<Role>;

@Schema({
  timestamps: true,
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
  },
  toJSON: {
    //delete __v from output JSON
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      ret.name = ret._id;
      delete ret._id;
      delete ret.updatedAt;
      delete ret.createdAt;
      return ret;
    },
  },
})
export class Role {
  @Prop({ type: String })
  _id: string;

  name: string;

  @Prop({ type: [String], ref: 'Permission' })
  permissions: Permission[];

  constructor(partial: Partial<Role>) {
    Object.assign(this, partial);
    if (partial.name) this._id = partial.name;
  }
}

export const RoleSchema = SchemaFactory.createForClass(Role);

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
      delete ret.updatedAt;
      delete ret.createdAt;
      return ret;
    },
  },
})
export class Role {
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Permission' })
  permissions: Permission[];

  constructor(partial: Partial<Role>) {
    Object.assign(this, partial);
  }
}

export const RoleSchema = SchemaFactory.createForClass(Role);

import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Role } from '../../rbac/roles/schemas/role.schema';
import { Organization } from '../../organizations/schemas/organization.schema';

export type UserRoleDocument = HydratedDocument<UserRole>;

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
export class UserRole {
  _id: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Role' })
  role: Role;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  })
  organization: Organization;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  constructor(partial: Partial<UserRole>) {
    Object.assign(this, partial);
  }
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole);

export const UserRoleColl = 'user_roles';

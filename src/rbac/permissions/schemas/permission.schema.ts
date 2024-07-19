import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Action } from '../entities/action.entity';
import { Subject } from '../entities/subject.entity';

export type PermissionDocument = HydratedDocument<Permission>;

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
export class Permission {
  _id: string;

  @Prop({ required: true })
  action: Action;

  @Prop()
  subject: Subject;

  constructor(partial: Partial<Permission>) {
    Object.assign(this, partial);
  }
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

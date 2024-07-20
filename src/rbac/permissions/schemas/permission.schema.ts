import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Action } from '../entities/action.entity';
import { Subject } from '../entities/subject.entity';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({
  timestamps: false,
  versionKey: false,
  toObject: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      // delete ret.password;
      return ret;
    },
  },
  toJSON: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      delete ret._id;
      return ret;
    },
  },
})
export class Permission {
  @Prop({
    type: String,
    default: function () {
      return `${this.action}_${this.subject}`;
    },
  })
  _id: string;

  @Prop({ required: true, index: true })
  action: Action;

  @Prop({ required: true, index: true })
  subject: Subject;

  constructor(partial: Partial<Permission>) {
    Object.assign(this, partial);
  }
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
PermissionSchema.index({ action: 1, subject: 1 }, { unique: true });

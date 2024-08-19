import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  UserNotificationAction,
  UserNotificationScope,
} from '../entities/user-notification.entity';

export type UserNotificationDocument = HydratedDocument<UserNotification>;

@Schema({
  timestamps: true,
  versionKey: false,
  toObject: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      delete ret.updatedAt;
      return ret;
    },
  },
  toJSON: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      delete ret.updatedAt;
      return ret;
    },
  },
})
export class UserNotification {
  @Prop({ type: String })
  _id: string;

  @Prop({
    type: String,
    ref: 'Organization',
  })
  organization: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: string;

  @Prop()
  action: UserNotificationAction;

  @Prop()
  scope: UserNotificationScope;

  @Prop({ required: true, type: Boolean })
  read: boolean;

  @Prop({ type: Map, of: String })
  data: Record<string, string>;

  constructor(partial: Partial<UserNotification>) {
    Object.assign(this, partial);
  }
}

export const UserNotificationSchema =
  SchemaFactory.createForClass(UserNotification);

export const UserNotificationColl = 'user_notifications';

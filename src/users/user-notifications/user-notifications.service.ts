import { Injectable } from '@nestjs/common';
import { CreateUserNotificationDto } from '../dto/create-user-notification.dto';
import { UpdateUserNotificationDto } from '../dto/update-user-notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserNotification,
  UserNotificationColl,
} from '../schemas/user-notification.schema';

@Injectable()
export class UserNotificationsService {
  constructor(
    @InjectModel(UserNotificationColl)
    private userNotificationModel: Model<UserNotification>,
  ) {}
  createOrUpdate(
    userId: string,
    createUserNotificationDto: CreateUserNotificationDto,
  ): Promise<UserNotification> {
    const notification = new UserNotification({
      user: new Types.ObjectId(userId),
      ...createUserNotificationDto,
    });

    return this.userNotificationModel.findOneAndReplace(
      { _id: notification._id },
      notification,
      { upsert: true, returnDocument: 'after' },
    );
  }

  findAll(userId: string): Promise<UserNotification[]> {
    return this.userNotificationModel
      .find({ user: new Types.ObjectId(userId) })
      .exec();
  }

  findOne(userId: string, notificationId: string): Promise<UserNotification> {
    return this.userNotificationModel
      .findOne({ user: new Types.ObjectId(userId), _id: notificationId })
      .exec();
  }

  update(
    notificationId: string,
    updateUserNotificationDto: UpdateUserNotificationDto,
  ): Promise<UserNotification> {
    return this.userNotificationModel.findByIdAndUpdate(
      notificationId,
      updateUserNotificationDto,
      { returnOriginal: false },
    );
  }

  remove(notificationId: string): Promise<UserNotification> {
    return this.userNotificationModel.findByIdAndDelete(notificationId).exec();
  }
}

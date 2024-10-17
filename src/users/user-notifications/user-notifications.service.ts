import { Injectable } from '@nestjs/common';
import { CreateUserNotificationDto } from '../dto/create-user-notification.dto';
import { UpdateUserNotificationDto } from '../dto/update-user-notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserNotification,
  UserNotificationColl,
} from '../schemas/user-notification.schema';
import { MongoAbility } from '@casl/ability';
import { accessibleBy } from '@casl/mongoose';
import { Action } from '../../rbac/permissions/entities/action.entity';
import { Organization } from '../../organizations/schemas/organization.schema';

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

  findAllWithAbility(
    userId: string,
    ability: MongoAbility,
  ): Promise<UserNotification[]> {
    return this.userNotificationModel
      .find({
        $and: [
          accessibleBy(ability, Action.Read).ofType(UserNotification),
          { user: new Types.ObjectId(userId) },
        ],
      })
      .exec();
  }

  findOne(userId: string, notificationId: string): Promise<UserNotification> {
    return this.userNotificationModel
      .findOne({ user: new Types.ObjectId(userId), _id: notificationId })
      .exec();
  }

  findOneWithAbility(
    userId: string,
    notificationId: string,
    ability: MongoAbility,
  ): Promise<UserNotification> {
    return this.userNotificationModel
      .findOne({
        $and: [
          accessibleBy(ability, Action.Read).ofType(UserNotification),
          { user: new Types.ObjectId(userId), _id: notificationId },
        ],
      })
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

  updateWithAbility(
    notificationId: string,
    updateUserNotificationDto: UpdateUserNotificationDto,
    ability: MongoAbility,
  ): Promise<UserNotification> {
    return this.userNotificationModel
      .findOneAndUpdate(
        {
          $and: [
            { _id: notificationId },
            accessibleBy(ability, Action.Update).ofType(UserNotification),
          ],
        },
        updateUserNotificationDto,
        { returnOriginal: false },
      )
      .exec();
  }

  remove(notificationId: string): Promise<UserNotification> {
    return this.userNotificationModel.findByIdAndDelete(notificationId).exec();
  }
}

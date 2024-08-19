import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { UserNotificationsService } from './user-notifications.service';
import { CreateUserNotificationDto } from '../dto/create-user-notification.dto';
import { UpdateUserNotificationDto } from '../dto/update-user-notification.dto';
import {
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { UserNotification } from '../schemas/user-notification.schema';
import { SuperAdminGuard } from '../../auth/super-admin.guard';

@ApiTags('Users (Notifications)')
@UseGuards(AuthGuard)
@Controller('users')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiNotFoundResponse({ description: 'User not found' })
export class UserNotificationsController {
  constructor(
    private readonly userNotificationsService: UserNotificationsService,
  ) {}

  @Put(':userId/notifications')
  @UseGuards(SuperAdminGuard)
  createOrUpdate(
    @Param('userId') userId: string,
    @Body() createUserNotificationDto: CreateUserNotificationDto,
  ): Promise<UserNotification> {
    return this.userNotificationsService.createOrUpdate(
      userId,
      createUserNotificationDto,
    );
  }

  @Get(':userId/notifications')
  findAll(@Param('userId') userId: string): Promise<UserNotification[]> {
    return this.userNotificationsService.findAll(userId);
  }

  @Get(':userId/notifications/:id')
  findOne(
    @Param('userId') userId: string,
    @Param('id') notificationId: string,
  ): Promise<UserNotification> {
    return this.userNotificationsService.findOne(userId, notificationId);
  }

  @Patch(':userId/notifications/:id')
  update(
    @Param('id') notificationId: string,
    @Body() updateUserNotificationDto: UpdateUserNotificationDto,
  ): Promise<UserNotification> {
    return this.userNotificationsService.update(
      notificationId,
      updateUserNotificationDto,
    );
  }

  @Delete(':userId/notifications/:id')
  @UseGuards(SuperAdminGuard)
  remove(@Param('id') notificationId: string): Promise<UserNotification> {
    return this.userNotificationsService.remove(notificationId);
  }
}

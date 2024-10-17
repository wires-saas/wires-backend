import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { UserNotificationsService } from './user-notifications.service';
import { CreateUserNotificationDto } from '../dto/create-user-notification.dto';
import { UpdateUserNotificationDto } from '../dto/update-user-notification.dto';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { UserNotification } from '../schemas/user-notification.schema';
import { SuperAdminGuard } from '../../auth/super-admin.guard';
import { AuthenticatedRequest } from '../../shared/types/authentication.types';

@ApiTags('Users (Notifications)')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UserNotificationsController {
  constructor(
    private readonly userNotificationsService: UserNotificationsService,
  ) {}

  @Put(':userId/notifications')
  @ApiExcludeEndpoint()
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
  @ApiOperation({ summary: 'Get all user notifications' })
  @ApiNotFoundResponse({ description: 'User not found' })
  findAll(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ): Promise<UserNotification[]> {
    return this.userNotificationsService.findAllWithAbility(
      userId,
      req.ability,
    );
  }

  @Get(':userId/notifications/:notificationId')
  @ApiOperation({ summary: 'Get user notification by ID' })
  @ApiOkResponse({ description: 'Notification found' })
  @ApiNotFoundResponse({ description: 'Notification not found' })
  async findOne(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Param('notificationId') notificationId: string,
  ): Promise<UserNotification> {
    const notification = await this.userNotificationsService.findOneWithAbility(
      userId,
      notificationId,
      req.ability,
    );

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  @Patch(':userId/notifications/:notificationId')
  @ApiOperation({ summary: 'Update user notification' })
  @ApiOkResponse({ description: 'Notification updated' })
  @ApiNotFoundResponse({ description: 'Notification not found' })
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('notificationId') notificationId: string,
    @Body() updateUserNotificationDto: UpdateUserNotificationDto,
  ): Promise<UserNotification> {
    const notification = await this.userNotificationsService.updateWithAbility(
      notificationId,
      updateUserNotificationDto,
      req.ability,
    );

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  @Delete(':userId/notifications/:notificationId')
  @ApiExcludeEndpoint()
  @UseGuards(SuperAdminGuard)
  remove(
    @Param('notificationId') notificationId: string,
  ): Promise<UserNotification> {
    return this.userNotificationsService.remove(notificationId);
  }
}

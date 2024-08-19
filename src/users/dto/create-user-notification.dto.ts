import {
  UserNotificationAction,
  UserNotificationScope,
} from '../entities/user-notification.entity';
import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserNotificationDto {
  @IsNotEmpty()
  @IsString()
  _id: string;

  @IsOptional()
  @IsString()
  organization?: string;

  @IsNotEmpty()
  @IsString()
  action: UserNotificationAction;

  @IsNotEmpty()
  @IsString()
  scope: UserNotificationScope;

  @IsDefined()
  @IsBoolean()
  read: boolean;

  @IsOptional()
  data?: Record<string, string>;
}

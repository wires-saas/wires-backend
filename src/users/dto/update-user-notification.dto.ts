import { IsBoolean, IsDefined } from 'class-validator';

export class UpdateUserNotificationDto {
  @IsDefined()
  @IsBoolean()
  read: boolean;
}

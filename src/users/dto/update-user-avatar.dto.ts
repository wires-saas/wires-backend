import { PartialType } from '@nestjs/swagger';
import { CreateUserAvatarDto } from './create-user-avatar.dto';

export class UpdateUserAvatarDto extends PartialType(CreateUserAvatarDto) {}

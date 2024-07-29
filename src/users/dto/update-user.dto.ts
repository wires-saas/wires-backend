import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, [] as const),
) {
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsNumber()
  lastSeenAt?: number;
}

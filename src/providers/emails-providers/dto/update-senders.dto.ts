import { IsNotEmpty, IsString } from 'class-validator';

export type UpdateSendersDto = SenderDto[];

export class SenderDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

import { IsDefined, IsString } from 'class-validator';

export class RequestGptDto {
  @IsDefined()
  @IsString()
  prompt: string;
}

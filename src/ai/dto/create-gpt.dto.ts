import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { GptAuthenticationType, SupportedGPT } from '../entities/ai.entities';

export class CreateGptDto {
  @IsNotEmpty()
  @IsEnum(SupportedGPT)
  model: SupportedGPT;

  @IsNotEmpty()
  @IsString()
  organization: string;

  @IsDefined()
  @IsNumber()
  requestsLimit: number;

  @IsDefined()
  @IsNumber()
  tokensLimit: number;

  @IsDefined()
  @IsEnum(GptAuthenticationType)
  authenticationType: GptAuthenticationType;

  @IsOptional()
  @IsString()
  apiKey?: string;
}

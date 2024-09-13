import { IsNumber, IsOptional } from 'class-validator';

export class UpdateGptUsageDto {
  @IsOptional()
  @IsNumber()
  requestsUsage?: number;

  @IsOptional()
  @IsNumber()
  tokensUsage?: number;

  @IsOptional()
  @IsNumber()
  requestsLimit?: number;

  @IsOptional()
  @IsNumber()
  tokensLimit?: number;

  @IsOptional()
  @IsNumber()
  requestsLimitReset?: number;

  @IsOptional()
  @IsNumber()
  tokensLimitReset?: number;

  @IsOptional()
  @IsNumber()
  lastRequest?: number;

  @IsOptional()
  @IsNumber()
  lastRequestStatusCode?: number;
}

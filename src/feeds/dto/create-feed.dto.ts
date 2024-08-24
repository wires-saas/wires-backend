import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  ScrapingAuthorizationType,
  ScrapingGranularity,
} from '../entities/scraping.entity';

export class CreateFeedDto {
  @IsNotEmpty()
  @IsString()
  displayName: string;

  @IsDefined()
  @IsString()
  description: string;

  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  urls: string[];

  @IsDefined()
  @IsNumber()
  scrapingInterval: number;

  @IsDefined()
  @IsString()
  scrapingGranularity: ScrapingGranularity;

  @IsOptional()
  @IsString()
  authorizationType: ScrapingAuthorizationType;

  @IsOptional()
  @IsString()
  authorizationUsername: string;

  @IsOptional()
  @IsString()
  authorizationToken: string;
}

import { PartialType } from '@nestjs/swagger';
import { CreateFeedDto } from './create-feed.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateFeedDto extends PartialType(CreateFeedDto) {
  @IsOptional()
  @IsBoolean()
  scrapingEnabled: boolean;
}

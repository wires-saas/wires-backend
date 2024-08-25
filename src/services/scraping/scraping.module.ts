import { Module } from '@nestjs/common';
import { SecurityModule } from '../security/security.module';
import { ScrapingService } from './scraping.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [SecurityModule, HttpModule],
  providers: [ScrapingService],
  exports: [ScrapingService],
})
export class ScrapingModule {}

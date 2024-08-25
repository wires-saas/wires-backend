import { Module } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { FeedsController } from './feeds.controller';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Feed, FeedSchema } from './schemas/feed.schema';
import { SecurityModule } from '../services/security/security.module';
import { FeedRunsController } from './runs/feed-runs.controller';
import { FeedRunsService } from './runs/feed-runs.service';
import { ScrapingModule } from '../services/scraping/scraping.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Feed.name, schema: FeedSchema }]),
    UsersModule,
    OrganizationsModule,
    SecurityModule,
    ScrapingModule,
  ],
  controllers: [FeedRunsController, FeedsController],
  providers: [FeedsService, FeedRunsService],
})
export class FeedsModule {}

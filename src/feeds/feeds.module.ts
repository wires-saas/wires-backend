import { Module } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { FeedsController } from './feeds.controller';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SecurityModule } from '../services/security/security.module';
import { FeedRunsController } from './runs/feed-runs.controller';
import { FeedRunsService } from './runs/feed-runs.service';
import { ScrapingModule } from '../services/scraping/scraping.module';
import { contentModels } from '../shared/mongoose-models';
import { ArticlesModule } from '../articles/articles.module';
import { ArticlesService } from '../articles/articles.service';
import { TagsService } from '../tags/tags.service';

@Module({
  imports: [
    MongooseModule.forFeature(contentModels),
    ArticlesModule,
    UsersModule,
    OrganizationsModule,
    SecurityModule,
    ScrapingModule,
  ],
  controllers: [FeedRunsController, FeedsController],
  providers: [FeedsService, FeedRunsService, ArticlesService, TagsService],
})
export class FeedsModule {}

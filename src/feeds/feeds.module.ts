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
import { ArticlesModule } from '../articles/articles.module';
import { Feed, FeedSchema } from './schemas/feed.schema';
import { FeedRunColl, FeedRunSchema } from './schemas/feed-run.schema';
import { Tag, TagSchema } from '../tags/schemas/tag.schema';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Feed.name, schema: FeedSchema },
      { name: FeedRunColl, schema: FeedRunSchema },
      { name: Tag.name, schema: TagSchema },
    ]),
    ArticlesModule,
    UsersModule,
    OrganizationsModule,
    SecurityModule,
    ScrapingModule,
    TagsModule,
  ],
  controllers: [FeedRunsController, FeedsController],
  providers: [FeedsService, FeedRunsService],
})
export class FeedsModule {}

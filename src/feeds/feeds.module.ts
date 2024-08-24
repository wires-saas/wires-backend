import { Module } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { FeedsController } from './feeds.controller';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Feed, FeedSchema } from './schemas/feed.schema';
import { SecurityModule } from '../services/security/security.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Feed.name, schema: FeedSchema }]),
    UsersModule,
    OrganizationsModule,
    SecurityModule,
  ],
  controllers: [FeedsController],
  providers: [FeedsService],
})
export class FeedsModule {}

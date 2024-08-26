import { forwardRef, Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { contentModels } from '../shared/mongoose-models';
import { UsersModule } from '../users/users.module';
import { FeedsModule } from '../feeds/feeds.module';
import { FeedsService } from '../feeds/feeds.service';
import { SecurityModule } from '../services/security/security.module';

@Module({
  imports: [
    MongooseModule.forFeature(contentModels),
    SecurityModule,
    UsersModule,
    forwardRef(() => FeedsModule),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, FeedsService],
})
export class ArticlesModule {}

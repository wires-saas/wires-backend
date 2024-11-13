import { forwardRef, Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { FeedsModule } from '../feeds/feeds.module';
import { SecurityModule } from '../services/security/security.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { Article, ArticleSchema } from './schemas/article.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    SecurityModule,
    UsersModule,
    OrganizationsModule,
    forwardRef(() => FeedsModule),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}

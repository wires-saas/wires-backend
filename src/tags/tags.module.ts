import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { contentModels } from '../shared/mongoose-models';
import { SecurityModule } from '../services/security/security.module';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    MongooseModule.forFeature(contentModels),
    SecurityModule,
    UsersModule,
    OrganizationsModule,
  ],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}

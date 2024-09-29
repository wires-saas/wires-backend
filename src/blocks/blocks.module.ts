import { Module } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { BlocksController } from './blocks.controller';
import { SecurityModule } from '../services/security/security.module';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { MongooseModule } from '@nestjs/mongoose';
import { studioModels } from '../shared/mongoose-models';

@Module({
  imports: [
    MongooseModule.forFeature(studioModels),
    SecurityModule,
    UsersModule,
    OrganizationsModule,
  ],
  controllers: [BlocksController],
  providers: [BlocksService],
})
export class BlocksModule {}

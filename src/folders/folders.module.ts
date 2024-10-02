import { Module } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { studioModels } from '../shared/mongoose-models';
import { SecurityModule } from '../services/security/security.module';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    MongooseModule.forFeature(studioModels),
    SecurityModule,
    UsersModule,
    OrganizationsModule,
  ],
  controllers: [FoldersController],
  providers: [FoldersService],
})
export class FoldersModule {}

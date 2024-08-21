import { forwardRef, Module } from '@nestjs/common';
import { UserAvatarsService } from './user-avatars.service';
import { UserAvatarsController } from './user-avatars.controller';
import { UsersModule } from '../users.module';
import { MongooseModule } from '@nestjs/mongoose';
import allModels from '../../shared/mongoose-models';
import { FileUploadModule } from '../../services/file-upload/file-upload.module';

@Module({
  imports: [
    MongooseModule.forFeature(allModels),
    forwardRef(() => UsersModule),
    FileUploadModule,
  ],
  controllers: [UserAvatarsController],
  providers: [UserAvatarsService],
})
export class UserAvatarsModule {}

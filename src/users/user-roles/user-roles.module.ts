import { forwardRef, Module } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { UserRolesController } from './user-roles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import allModels from '../../shared/mongoose-models';
import { SecurityModule } from '../../services/security/security.module';
import { UsersModule } from '../users.module';

@Module({
  imports: [
    MongooseModule.forFeature(allModels),
    SecurityModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [UserRolesController],
  providers: [UserRolesService],
  exports: [UserRolesService],
})
export class UserRolesModule {}

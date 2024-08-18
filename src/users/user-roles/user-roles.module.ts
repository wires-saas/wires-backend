import { Module } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { UserRolesController } from './user-roles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import allModels from '../../shared/mongoose-models';
import { CaslAbilityFactory } from '../../rbac/casl/casl-ability.factory';
import { UsersService } from '../users.service';
import { SecurityModule } from '../../services/security/security.module';

@Module({
  imports: [MongooseModule.forFeature(allModels), SecurityModule],
  controllers: [UserRolesController],
  providers: [UserRolesService, UsersService, CaslAbilityFactory],
  exports: [UserRolesService],
})
export class UserRolesModule {}

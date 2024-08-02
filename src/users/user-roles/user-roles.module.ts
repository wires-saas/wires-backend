import { Module } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { UserRolesController } from './user-roles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRoleColl, UserRoleSchema } from '../schemas/user-role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserRoleColl, schema: UserRoleSchema }]),
  ],
  controllers: [UserRolesController],
  providers: [UserRolesService],
  exports: [UserRolesService],
})
export class UserRolesModule {}

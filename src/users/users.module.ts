import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { EncryptService } from '../commons/encrypt.service';
import { HashService } from '../commons/hash.service';
import { UserRolesModule } from './user-roles/user-roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserRolesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, EncryptService, HashService],
})
export class UsersModule {}

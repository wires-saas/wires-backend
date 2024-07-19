import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { EncryptService } from '../commons/encrypt.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { HashService } from '../commons/hash.service';
import { JwtModule } from '@nestjs/jwt';
import { config as readEnvFile } from 'dotenv';

readEnvFile();
const jwtSecret = process.env.JWT_SECRET;
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      global: true,
      secret: jwtSecret,
      signOptions: { expiresIn: '300s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, EncryptService, HashService],
})
export class AuthModule {}

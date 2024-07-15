import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from './entities/user-status.entity';
import { UserEmailStatus } from './entities/user-email-status.entity';
import * as crypto from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  private users: User[] = [];

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  convertToEntity(createUserDto: CreateUserDto): User {
    return new User({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      isSuperAdmin: false,
      isOrgAdmin: createUserDto.isOrgAdmin,
      status: UserStatus.PENDING,
      email: createUserDto.email,
      emailStatus: UserEmailStatus.UNCONFIRMED,
      emailChangeCandidate: '',
      password: '',
      passwordResetToken: crypto.randomBytes(32).toString('hex'),
      passwordResetTokenExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      emailVerificationToken: '',
      emailVerificationTokenExpiresAt: 0,
      lastSeenAt: 0,
    });
  }

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.convertToEntity(createUserDto);
    return new this.userModel(user).save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const match = await this.userModel.findById(id).exec();
    if (!match) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return match;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    const match = this.users.find((user) => user._id === id);
    if (!match) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

    const userUpdated = new User({ ...match, ...updateUserDto });

    // TODO change updateUserDto and have custom logic for password/email change

    this.users = this.users.map((user) =>
      user._id === id ? userUpdated : user,
    );

    return userUpdated;
  }

  async remove(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}

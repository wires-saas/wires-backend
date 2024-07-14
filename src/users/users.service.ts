import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserStatus } from './entities/user-status.entity';
import { UserEmailStatus } from './entities/user-email-status.entity';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  private users: User[] = [];

  convertToEntity(createUserDto: CreateUserDto): User {
    return new User({
      id: new Date().toISOString(),
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

  create(createUserDto: CreateUserDto): User {
    const user = this.convertToEntity(createUserDto);
    this.users = [...this.users, user];
    return user;
  }

  findAll() {
    return this.users;
  }

  findOne(id: string) {
    const match = this.users.find((user) => user.id === id);
    if (!match) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return match;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    const match = this.users.find((user) => user.id === id);
    if (!match) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

    const userUpdated = new User({ ...match, ...updateUserDto });

    // TODO change updateUserDto and have custom logic for password/email change

    this.users = this.users.map((user) =>
      user.id === id ? userUpdated : user,
    );

    return userUpdated;
  }

  remove(id: string) {
    this.users = this.users.filter((user) => user.id !== id);
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from './entities/user-status.entity';
import { UserEmailStatus } from './entities/user-email-status.entity';
import * as crypto from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { EncryptService } from '../commons/encrypt.service';
import { canReferenceNode } from '@nestjs/swagger/dist/plugin/utils/plugin-utils';
import { HashService } from '../commons/hash.service';

@Injectable()
export class UsersService {
  private users: User[] = [];

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private encryptService: EncryptService,
    private hashService: HashService,
  ) {}

  convertToEntity(createUserDto: CreateUserDto): User {
    return new User({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      isSuperAdmin: false,
      status: UserStatus.PENDING,
      email: this.encryptService.encrypt(createUserDto.email),
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
    return this.userModel
      .find()
      .exec()
      .then((users) => {
        return users.map((user) => {
          try {
            user.email = this.encryptService.decrypt(user.email);
          } catch (err) {
            throw new HttpException(
              'Invalid decryption',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
          return user;
        });
      });
  }

  async findOne(id: string): Promise<User> {
    return this.userModel
      .findById(id)
      .exec()
      .then((user) => {
        if (!user) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        user.email = this.encryptService.decrypt(user.email);
        return user;
      });
  }

  // As email is encrypted, we need to decrypt it all users base before finding a match
  async findOneByEmail(email: string): Promise<User> {
    return this.userModel
      .find()
      .exec()
      .then((users) => {
        console.log(users.map((usr) => this.encryptService.decrypt(usr.email)));
        const user = users.find((usr) => {
          return email === this.encryptService.decrypt(usr.email);
        });
        console.log(user);

        if (!user) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        return user;
      });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashService.hash(
        updateUserDto.password,
      );
    }

    if (updateUserDto.email) {
      updateUserDto.email = this.encryptService.encrypt(updateUserDto.email);
    }

    return this.userModel.findByIdAndUpdate(
      id,
      new User({
        ...updateUserDto,
      }),
      { returnOriginal: false },
    );
  }

  async remove(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}

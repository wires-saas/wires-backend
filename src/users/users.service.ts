import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from './entities/user-status.entity';
import { UserEmailStatus } from './entities/user-email-status.entity';
import * as crypto from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { EncryptService } from '../commons/encrypt.service';
import { HashService } from '../commons/hash.service';
import { UserRole, UserRoleColl } from './schemas/user-role.schema';
import { MongoAbility } from '@casl/ability';
import { Action } from '../rbac/permissions/entities/action.entity';
import { CaslUtils } from '../rbac/casl/casl.utils';
import { RoleName } from '../commons/types/authentication.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserRoleColl) private userRoleModel: Model<UserRole>,
    private encryptService: EncryptService,
    private hashService: HashService,
  ) {}

  private convertToEntity(createUserDto: CreateUserDto): User {
    return new User({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      isSuperAdmin: false,
      status: UserStatus.PENDING,

      street: createUserDto.street || '',
      city: createUserDto.city || '',
      zipCode: createUserDto.zipCode || '',
      country: createUserDto.country || '',

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

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.convertToEntity(createUserDto);

    const userCreated = await new this.userModel(user).save();

    const userRole = new UserRole({
      organization: createUserDto.organization,
      role: RoleName.USER,
      user: userCreated._id,
    });

    await new this.userRoleModel(userRole).save();

    return userCreated;
  }

  async findAll(ability: MongoAbility, orgs?: string[]): Promise<User[]> {
    let pipeline: PipelineStage[] = [
      // Left join with user roles
      {
        $lookup: {
          from: UserRoleColl,
          localField: '_id',
          foreignField: 'user',
          as: 'roles',
        },
      },

      // Following pipeline stages are used to calculate "organizations" field
      {
        $unwind: {
          path: '$roles',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          document: { $first: '$$ROOT' },
          organizations: { $addToSet: '$roles.organization' },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$document', { organizations: '$organizations' }],
          },
        },
      },
    ];

    if (ability.cannot(Action.Manage, 'all')) {
      pipeline = [
        ...pipeline,
        CaslUtils.getUserOrganizationsPipelineStageFromAbility(
          ability,
          Action.Read,
          orgs?.length ? orgs : undefined,
        ),
      ];
    } else {
      // Applying organization filter if provided
      if (orgs?.length) {
        pipeline = [
          ...pipeline,
          {
            $match: {
              organizations: {
                $in: orgs,
              },
            },
          },
        ];
      }
    }

    return this.userModel
      .aggregate(pipeline)
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
          // as we are working with an aggregate, we need custom logic
          // to enforce schema validation
          return new this.userModel(user).toObject();
        });
      });
  }

  async findOne(id: string, withRoles: boolean): Promise<User> {
    return this.userModel
      .findById(id)
      .exec()
      .then(async (user) => {
        if (!user) throw new NotFoundException('User not found');
        user.email = this.encryptService.decrypt(user.email);

        if (withRoles) {
          const roles: UserRole[] = await this.userRoleModel
            .find({ user: user._id })
            .populate('role')
            .exec()
            .catch(() => []);

          if (roles) user.roles = roles;
        }

        console.log(user.organizations);

        return user;
      });
  }

  // As email is encrypted, we need to decrypt it all users base before finding a match
  async findOneByEmail(email: string): Promise<User> {
    return this.userModel
      .find()
      .exec()
      .then(async (users) => {
        const user = users.find((usr) => {
          return email === this.encryptService.decrypt(usr.email);
        });

        if (!user) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

        // adding roles
        const roles: UserRole[] = await this.userRoleModel
          .find({ user: user._id })
          .populate('role')
          .exec()
          .catch(() => []);

        if (roles?.length) user.roles = roles;

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

  async remove(id: string, organization: string) {
    const userRoles = await this.userRoleModel.find({ user: id }).exec();

    if (userRoles?.length) {
      // removing all roles in the organization
      await this.userRoleModel.deleteMany({ user: id, organization }).exec();
    }

    const userRolesPostDelete = await this.userRoleModel
      .find({ user: id })
      .exec();

    if (!userRolesPostDelete?.length) {
      // user has no role in any organization, deleting user
      return this.userModel.findByIdAndDelete(id).exec();
    }
  }
}

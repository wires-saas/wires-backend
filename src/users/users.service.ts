import {
  Injectable,
  InternalServerErrorException,
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
import { EncryptService } from '../services/security/encrypt.service';
import { HashService } from '../services/security/hash.service';
import { UserRole, UserRoleColl } from './schemas/user-role.schema';
import { MongoAbility } from '@casl/ability';
import { Action } from '../rbac/permissions/entities/action.entity';
import { CaslUtils } from '../rbac/casl/casl.utils';
import { RoleName } from '../shared/types/authentication.types';
import { UserRolesService } from './user-roles/user-roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    // @InjectModel(UserRoleColl) private userRoleModel: Model<UserRole>,
    private userRoleService: UserRolesService,
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
      passwordResetToken: '',
      passwordResetTokenExpiresAt: 0,
      inviteToken: crypto.randomBytes(32).toString('hex'),
      inviteTokenExpiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000,
      emailVerificationToken: '',
      emailVerificationTokenExpiresAt: 0,
      lastSeenAt: 0,
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.convertToEntity(createUserDto);

    const userCreated = await new this.userModel(user).save();

    await this.userRoleService.createOrUpdate(userCreated._id, [
      {
        organization: createUserDto.organization,
        role: RoleName.USER,
      },
    ]);

    // await new this.userRoleModel(userRole).save();

    // return this.findOne(userCreated._id, true);
    return await this.findOne(userCreated._id, true);
  }

  async findAll(
    ability: MongoAbility,
    orgs?: string[],
  ): Promise<UserDocument[]> {
    // Common pipeline stages used both by regular users and super admins

    const lookupUserRoles = {
      $lookup: {
        from: UserRoleColl,
        localField: '_id',
        foreignField: 'user',
        as: 'roles',
      },
    };

    const unwindRoles = {
      $unwind: {
        path: '$roles',
        preserveNullAndEmptyArrays: true,
      },
    };

    const regroupRoles = {
      $group: {
        _id: '$_id',
        document: { $first: '$$ROOT' },
        organizations: { $addToSet: '$roles.organization' },
        roles: { $push: '$roles' },
      },
    };

    const mergeRoles = {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            '$document',
            { organizations: '$organizations', roles: '$roles' },
          ],
        },
      },
    };

    let pipeline: PipelineStage[];

    if (ability.cannot(Action.Manage, 'all')) {
      const organizationRestrictions =
        CaslUtils.getUserOrganizationsFromAbility(ability, Action.Read);

      // Specific pipeline stages restricting roles and organizations

      const restrictRolesToAvailableOrganizations = {
        $set: {
          roles: {
            $filter: {
              input: '$roles',
              as: 'role',
              cond: { $in: ['$$role.organization', organizationRestrictions] },
            },
          },
        },
      };

      const filterByOrganizations = {
        $match: {
          organizations: {
            $in: orgs?.length ? orgs : organizationRestrictions,
          },
        },
      };

      pipeline = [
        lookupUserRoles,
        restrictRolesToAvailableOrganizations,

        // Following pipeline stages are used to calculate "organizations" field
        unwindRoles,
        regroupRoles,
        mergeRoles,

        filterByOrganizations,
      ];
    } else {
      // Applying organization filter if provided
      if (orgs?.length) {
        pipeline = [
          lookupUserRoles,

          // Following pipeline stages are used to calculate "organizations" field
          unwindRoles,
          regroupRoles,
          mergeRoles,

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
            throw new InternalServerErrorException('Invalid decryption');
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
          const roles: UserRole[] = await this.userRoleService.findAll(
            id,
            false,
          );

          if (roles) user.roles = roles;
        }

        return user;
      });
  }

  async findOneByInviteToken(token: string): Promise<User> {
    // TODO add token expiration check
    return this.userModel
      .findOne({ inviteToken: token })
      .exec()
      .then(async (user) => {
        if (!user) throw new NotFoundException('User not found');

        const roles: UserRole[] = await this.userRoleService
          .findAll(user._id, false)
          .catch(() => []);

        if (roles) user.roles = roles;

        return user;
      });
  }

  async findOneByPasswordResetToken(token: string): Promise<User> {
    // TODO add token expiration check
    return this.userModel
      .findOne({ passwordResetToken: token })
      .exec()
      .then(async (user) => {
        if (!user) throw new NotFoundException('User not found');

        const roles: UserRole[] = await this.userRoleService
          .findAll(user._id, false)
          .catch(() => []);

        if (roles) user.roles = roles;

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

        if (!user) throw new NotFoundException('User not found');

        // adding roles
        const roles: UserRole[] = await this.userRoleService
          .findAll(user._id, false)
          .catch(() => []);

        if (roles?.length) user.roles = roles;
        user.email = this.encryptService.decrypt(user.email);

        return user;
      });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashService.hash(
        updateUserDto.password,
      );

      // TODO update password workflow
    }

    if (updateUserDto.email) {
      updateUserDto.email = this.encryptService.encrypt(updateUserDto.email);

      // TODO update email workflow
    }

    return this.userModel.findByIdAndUpdate(
      id,
      new User({
        ...updateUserDto,
      }),
      { returnOriginal: false },
    );
  }

  async verifyInviteOfUser(id: string, password: string): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      id,
      new User({
        status: UserStatus.ACTIVE,
        emailStatus: UserEmailStatus.CONFIRMED,
        password: await this.hashService.hash(password),
        inviteTokenExpiresAt: 0,
      }),
      { returnOriginal: false },
    );
  }

  async resetPasswordOfUser(id: string, password: string): Promise<User> {
    return this.userModel.findByIdAndUpdate(
      id,
      new User({
        password: await this.hashService.hash(password),
        passwordResetTokenExpiresAt: 0,
        passwordResetToken: '',
      }),
      { returnOriginal: false },
    );
  }

  async remove(id: string, organization: string) {
    const userRoles = await this.userRoleService.findAll(id);

    if (userRoles?.length) {
      // removing all roles in the organization
      await this.userRoleService.removeAllByOrganization(id, organization);
    }

    const userRolesPostDelete = await this.userRoleService.findAll(id);

    if (!userRolesPostDelete?.length) {
      // user has no role in any organization, deleting user
      return this.userModel.findByIdAndDelete(id).exec();
    }
  }
}

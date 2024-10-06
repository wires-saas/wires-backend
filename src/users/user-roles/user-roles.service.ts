import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserRole, UserRoleColl } from '../schemas/user-role.schema';
import { UserRoleDto } from '../dto/user-role.dto';
import { UserRoleWithPermissions } from '../../shared/types/authentication.types';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectModel(UserRoleColl)
    private userRoleModel: Model<UserRole>,
  ) {}

  async createOrUpdate(
    userId: string,
    dtos: UserRoleDto[],
  ): Promise<UserRole[]> {
    const userRoles = dtos.map(
      (dto) =>
        new UserRole({
          ...dto,
          user: new Types.ObjectId(userId),
        }),
    );

    return this.userRoleModel.insertMany(userRoles);
  }

  async findAllUserRolesWithPermissions(
    userId: string,
  ): Promise<UserRoleWithPermissions[]> {
    // we have to do a join on 'roles' collection (using organization + role)
    // and then another join on 'permissions' collection

    return (await this.userRoleModel.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      {
        $lookup: {
          from: 'roles',
          localField: 'organization',
          foreignField: '_id.organization',

          // restrict to the same organization
          let: { roleFromUserRole: '$role' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$$roleFromUserRole', '$_id.role'],
                },
              },
            },
          ],
          as: 'role',
        },
      },
      {
        $unwind: '$role',
      },
      {
        $lookup: {
          from: 'permissions',
          localField: 'role.permissions',
          foreignField: '_id',
          as: 'permissions',
        },
      },
      {
        $project: {
          _id: 0,
          user: 1,
          role: '$role._id.role',
          organization: 1,
          permissions: 1,
        },
      },
    ])) as any;
  }

  async findAll(userId: string): Promise<UserRole[]> {
    return this.userRoleModel.find({ user: new Types.ObjectId(userId) }).exec();
  }

  removeAll(userId: string) {
    return this.userRoleModel
      .deleteMany({ user: new Types.ObjectId(userId) })
      .exec();
  }

  removeAllByOrganization(userId: string, organizationId: string) {
    return this.userRoleModel
      .deleteMany({
        user: new Types.ObjectId(userId),
        organization: organizationId,
      })
      .exec();
  }

  async removeOne(userId: string, dto: UserRoleDto) {
    return this.userRoleModel
      .deleteOne({
        user: new Types.ObjectId(userId),
        role: dto.role,
        organization: dto.organization,
      })
      .exec();
  }

  async removeOneById(id: string) {
    return this.userRoleModel.deleteOne({ _id: id }).exec();
  }
}

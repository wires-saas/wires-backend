import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
          user: userId,
        }),
    );

    return this.userRoleModel.insertMany(userRoles);
  }

  async findAllUserRolesWithPermissions(
    userId: string,
  ): Promise<UserRoleWithPermissions[]> {
    // TODO now we cannot populate role 'simply'
    // we have to do a join on 'roles' collection (using role + organization)
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

    /*
      .find({ user: userId })
      .populate('role', 'name')
      .populate('organization')
      .populate('user')
      .exec()) as any;*/
  }

  async findAll(
    userId: string,
    deepPopulateRole: boolean = true,
  ): Promise<UserRole[]> {
    if (deepPopulateRole) {
      return this.userRoleModel
        .find({ user: userId })
        .populate('organization')
        .populate('user')
        .populate({
          path: 'role',
          populate: { path: 'permissions', model: 'Permission' },
        })
        .exec();
    } else {
      return this.userRoleModel.find({ user: userId }).exec();
    }
  }

  async findAllNoPopulate(userId: string): Promise<UserRole[]> {
    return this.userRoleModel.find({ user: userId }).exec();
  }

  removeAll(userId: string) {
    return this.userRoleModel.deleteMany({ user: userId }).exec();
  }

  removeAllByOrganization(userId: string, organizationId: string) {
    return this.userRoleModel
      .deleteMany({ user: userId, organization: organizationId })
      .exec();
  }

  async removeOne(userId: string, dto: UserRoleDto) {
    return this.userRoleModel
      .deleteOne({
        user: userId,
        role: dto.role,
        organization: dto.organization,
      })
      .exec();
  }

  async removeOneById(id: string) {
    return this.userRoleModel.deleteOne({ _id: id }).exec();
  }
}

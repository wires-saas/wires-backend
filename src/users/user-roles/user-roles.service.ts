import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole, UserRoleColl } from '../schemas/user-role.schema';
import { UserRoleDto } from '../dto/user-role.dto';

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
      return this.userRoleModel.find({ user: userId }).populate('role').exec();
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

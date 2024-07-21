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

  async findAll(userId: string): Promise<UserRole[]> {
    return this.userRoleModel
      .find({ user: userId })
      .populate(['role', 'user', 'organization'])
      .exec();
  }

  removeAll(userId: string) {
    return this.userRoleModel.deleteMany({ user: userId }).exec();
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
}

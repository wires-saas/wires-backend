import { Injectable } from '@nestjs/common';
import { RoleDto } from './dto/role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: Model<Role>,
  ) {}

  async create(organizationId: string, roleDto: RoleDto): Promise<Role> {
    // TODO implement (missing id creation)
    throw new Error('Method not implemented');
    // const role = new Role({ ...roleDto, organization: organizationId });
    // return new this.roleModel(role).save();
  }

  async update(
    organizationId: string,
    roleId: string,
    roleDto: RoleDto,
  ): Promise<Role> {
    return this.roleModel.findOneAndUpdate(
      {
        '_id.organization': organizationId,
        '_id.role': roleId,
      },
      new Role({
        ...roleDto,
      }),
      { returnOriginal: false },
    );
  }

  async findAll(organizationId: string): Promise<Role[]> {
    // By populating we exclude deleted/non-existent permissions
    return this.roleModel
      .find({ '_id.organization': organizationId })
      .populate('permissions')
      .exec();
  }

  findOne(organizationId: string, roleId: string) {
    return this.roleModel
      .findOne({
        '_id.organization': organizationId,
        '_id.role': roleId,
      })
      .populate('permissions')
      .exec();
  }

  remove(organizationId: string, roleId: string) {
    return this.roleModel
      .findOneAndDelete({
        '_id.organization': organizationId,
        '_id.role': roleId,
      })
      .exec();
  }
}

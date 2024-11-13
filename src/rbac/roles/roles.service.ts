import { Injectable, Logger } from '@nestjs/common';
import { RoleDto } from './dto/role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './schemas/role.schema';
import { UserRolesService } from '../../users/user-roles/user-roles.service';
import { RoleName } from '../../shared/types/authentication.types';
import { AdminRolePermissions } from './entities/admin-role.permissions';
import { ManagerRolePermissions } from './entities/manager-role.permissions';
import { UserRolePermissions } from './entities/user-role.permissions';

@Injectable()
export class RolesService {
  private logger = new Logger(RolesService.name);

  constructor(
    @InjectModel(Role.name)
    private roleModel: Model<Role>,
    private userRolesService: UserRolesService,
  ) {}

  async createBasicRolesForNewOrganization(
    organizationId: string,
  ): Promise<Role[]> {
    this.logger.log('Creating basic roles for organization', organizationId);

    const roles = [
      new Role({
        _id: {
          organization: organizationId,
          role: RoleName.ADMIN,
        },
        permissions: AdminRolePermissions,
      }),
      new Role({
        _id: {
          organization: organizationId,
          role: RoleName.MANAGER,
        },
        permissions: ManagerRolePermissions,
      }),
      new Role({
        _id: {
          organization: organizationId,
          role: RoleName.USER,
        },
        permissions: UserRolePermissions,
      }),
    ];

    return this.roleModel.insertMany(roles);
  }

  async create(organizationId: string, roleDto: RoleDto): Promise<Role> {
    const role = new Role({
      _id: {
        organization: organizationId,
        role: roleDto.name,
      },
      permissions: roleDto.permissions,
    });

    return new this.roleModel(role).save();
  }

  async updatePermissions(
    organizationId: string,
    roleDto: RoleDto,
  ): Promise<Role> {
    this.logger.log('Updating permissions for role', roleDto.name);
    return this.roleModel.findOneAndUpdate(
      {
        '_id.organization': organizationId,
        '_id.role': roleDto.name,
      },
      {
        permissions: roleDto.permissions,
      },
      { returnOriginal: false },
    );
  }

  async updateName(organizationId: string, roleDto: RoleDto): Promise<Role> {
    this.logger.log(
      'Updating role name and permissions from ' +
        roleDto.previousName +
        ' to ' +
        roleDto.name,
    );

    // Creation of role required to change compound id field
    const updatedRole = await this.create(organizationId, roleDto);

    // Update user roles with new role name
    await this.userRolesService.updateRoleName(
      organizationId,
      roleDto.previousName,
      roleDto.name,
    );

    // Deletion of previous role
    await this.roleModel.findOneAndDelete({
      '_id.organization': organizationId,
      '_id.role': roleDto.previousName,
    });

    return updatedRole;
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

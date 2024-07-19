import { Injectable } from '@nestjs/common';
import { CreateOrUpdateUserRoleDto } from '../dto/create-or-update-user-role.dto';

@Injectable()
export class UserRolesService {
  createOrUpdate(
    userId: string,
    createUserRoleDto: CreateOrUpdateUserRoleDto,
  ): any {
    return 'This action adds a new userRole';
  }

  setAll(userId: string, userRoles: CreateOrUpdateUserRoleDto[]): any {
    return 'This action sets all user roles';
  }

  findAll(userId: string): any {
    return `This action returns all roles of user #${userId}`;
  }

  removeAll(userId: string) {
    return `This action removes all user #${userId} roles`;
  }

  remove(userId: string, roleId: string) {
    return `This action removes user #${userId} role #${roleId}`;
  }
}

import { Injectable } from '@nestjs/common';
import { CreateOrUpdateUserRoleDto } from '../dto/create-or-update-user-role.dto';

@Injectable()
export class UserRolesService {
  createOrUpdate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createUserRoleDto: CreateOrUpdateUserRoleDto,
  ): any {
    return 'This action adds a new userRole';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

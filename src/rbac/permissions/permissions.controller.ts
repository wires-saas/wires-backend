import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { SuperAdminGuard } from '../../auth/super-admin.guard';
import { AuthGuard } from '../../auth/auth.guard';

@ApiTags('Access Control')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(AuthGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @ApiExcludeEndpoint()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Delete(':permissionId')
  @UseGuards(SuperAdminGuard)
  @ApiExcludeEndpoint()
  remove(@Param('permissionId') permissionId: string) {
    return this.permissionsService.remove(permissionId);
  }
}

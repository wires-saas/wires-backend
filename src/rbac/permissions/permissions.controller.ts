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
import { ApiTags } from '@nestjs/swagger';
import { SuperAdminGuard } from '../../auth/super-admin.guard';

@ApiTags('Access Control')
@Controller('permissions')
@UseGuards(SuperAdminGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}

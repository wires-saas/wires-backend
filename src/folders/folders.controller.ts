import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { ApiTags } from '@nestjs/swagger';
import { OrganizationGuard } from '../auth/organization.guard';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { Folder } from './schemas/folder.schema';

@ApiTags('Folders')
@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId/folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() createFolderDto: CreateFolderDto,
  ) {
    if (createFolderDto.parentFolder) {
      const parentFolder = await this.foldersService.findOne(
        organizationId,
        createFolderDto.parentFolder,
      );

      if (!parentFolder) {
        throw new NotFoundException('Parent folder not found');
      }
    }

    return this.foldersService.create(organizationId, createFolderDto);
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<Folder[]> {
    return this.foldersService.findAllOfOrganization(organizationId);
  }

  @Get(':folderId')
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('folderId') folderId: string,
  ) {
    return this.foldersService.findOne(organizationId, folderId);
  }

  @Patch(':folderId')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('folderId') folderId: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    if (updateFolderDto.parentFolder) {
      const parentFolder = await this.foldersService.findOne(
        organizationId,
        updateFolderDto.parentFolder,
      );

      if (!parentFolder) {
        throw new NotFoundException('Parent folder not found');
      }
    }

    return this.foldersService.update(
      organizationId,
      folderId,
      updateFolderDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.foldersService.remove(+id, true);
  }
}

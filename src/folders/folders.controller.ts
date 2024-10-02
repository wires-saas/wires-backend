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
  BadRequestException,
  Put,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { ApiTags } from '@nestjs/swagger';
import { OrganizationGuard } from '../auth/organization.guard';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { Folder } from './schemas/folder.schema';
import { ResourcesService } from './resources.service';
import { Resource } from './schemas/resource.schema';
import { ResourceDto } from './dto/resource.dto';

@ApiTags('Folders')
@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId/folders')
export class FoldersController {
  constructor(
    private readonly foldersService: FoldersService,
    private readonly resourcesService: ResourcesService,
  ) {}

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

  // Resources

  @Put(':folderId/resources/:resourceId')
  async addResource(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('folderId') folderId: string,
    @Param('resourceId') resourceId: string,
    @Body() resourceDto: ResourceDto,
  ): Promise<Resource> {
    resourceDto.folder = folderId;
    resourceDto.organization = organizationId;
    resourceDto.resource = resourceId;

    const resource = await this.resourcesService.findOne(
      organizationId,
      folderId,
      resourceId,
    );

    if (!resource)
      return this.resourcesService.create(organizationId, resourceDto);
    else return resource;
  }

  @Get(':folderId/resources')
  async getResources(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('folderId') folderId: string,
  ): Promise<Resource[]> {
    return this.resourcesService.findAllOfFolder(organizationId, folderId);
  }
}

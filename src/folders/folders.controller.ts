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
  Logger,
  Query,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrganizationGuard } from '../auth/organization.guard';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { Folder } from './schemas/folder.schema';
import { FolderItemsService } from './folder-items.service';
import { FolderItemDto } from './dto/folder-item.dto';
import { BlocksService } from '../blocks/blocks.service';
import { Block } from '../blocks/schemas/block.schema';
import { FolderItem } from './schemas/folder-item.schema';
import { FolderItemType } from './entities/folder-item-type';

@ApiTags('Folders')
@ApiBearerAuth()
@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId/folders')
export class FoldersController {
  private logger = new Logger(FoldersController.name);

  constructor(
    private readonly foldersService: FoldersService,
    private readonly folderItemsService: FolderItemsService,
    private readonly blocksService: BlocksService,
  ) {}

  @Post()

  async create(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() createFolderDto: CreateFolderDto,
  ) {

    if (req.ability.cannot(Action.Create, ScopedSubject(Folder, organizationId))) {

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

  @Delete(':folderId')
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('folderId') folderId: string,
  ) {
    return this.foldersService.remove(organizationId, folderId, true);
  }

  // Folder Items

  @Put(':folderId/items/:itemId')
  async addFolderItem(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('folderId') folderId: string,
    @Param('itemId') itemId: string,
    @Body() itemDto: FolderItemDto,
  ): Promise<FolderItem> {
    itemDto.folder = folderId;
    itemDto.organization = organizationId;
    itemDto.item = itemId;

    const item = await this.folderItemsService.findOne(
      organizationId,
      folderId,
      itemId,
    );

    if (!item) return this.folderItemsService.create(organizationId, itemDto);
    else return item;
  }

  @Get(':folderId/items')
  async getFolderItems(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('folderId') folderId: string,
    @Query('type') type?: FolderItemType,
  ): Promise<Array<Block>> {
    let items = await this.folderItemsService.findAllOfFolder(
      organizationId,
      folderId,
    );

    if (type) items = items.filter((i) => i.type === type);

    const itemsPopulated = [];

    for (const item of items) {
      switch (item.type) {
        case FolderItemType.Block:
          const block: Block = await this.blocksService.findOne(
            item._id.organization,
            item._id.item,
          );

          itemsPopulated.push(block);
          break;
        default:
          this.logger.error('Item type not supported', item.type);
          throw new BadRequestException('Item type not supported');
      }
    }

    return itemsPopulated;
  }

  @Delete(':folderId/items/:itemId')
  async removeFolderItem(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('folderId') folderId: string,
    @Param('itemId') itemId: string,
  ) {
    const folder = await this.foldersService.findOne(organizationId, folderId);

    if (!folder) throw new NotFoundException('Folder not found');

    const item = await this.folderItemsService.findOne(
      organizationId,
      folderId,
      itemId,
    );

    if (!item) throw new NotFoundException('Item not found');

    return this.folderItemsService.remove(organizationId, folderId, itemId);
  }
}

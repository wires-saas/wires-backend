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
  UnauthorizedException,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { OrganizationGuard } from '../auth/organization.guard';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { Folder } from './schemas/folder.schema';
import { FolderItemsService } from './folder-items.service';
import { FolderItemDto } from './dto/folder-item.dto';
import { BlocksService } from '../blocks/blocks.service';
import { Block } from '../blocks/schemas/block.schema';
import { FolderItem } from './schemas/folder-item.schema';
import { FolderItemType } from './entities/folder-item-type';
import { Action } from '../rbac/permissions/entities/action.entity';
import { ScopedSubject } from '../rbac/casl/casl.utils';

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

  private async fetchAllFolderItems(
    organizationId: string,
    folderId: string,
    recursive: boolean,
  ): Promise<FolderItem[]> {
    // Fetch all items in the current folder
    let items: FolderItem[] = await this.folderItemsService.findAllOfFolder(
      organizationId,
      folderId,
    );

    if (recursive) {
      // Fetch all child folders of the current folder
      const subfolders = await this.foldersService.findAllWithParent(
        organizationId,
        folderId,
      );

      // Recursively fetch items from all subfolders
      for (const subfolder of subfolders) {
        const subfolderItems = await this.fetchAllFolderItems(
          organizationId,
          subfolder.id,
          true,
        );
        items = items.concat(subfolderItems);
      }
    }

    return items;
  }

  @Post()
  @ApiOperation({ summary: 'Create new folder' })
  @ApiUnauthorizedResponse({
    description: 'Cannot create folder, requires "Create Folder" permission',
  })
  @ApiNotFoundResponse({ description: 'Parent folder not found' })
  async create(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() createFolderDto: CreateFolderDto,
  ): Promise<Folder> {
    if (
      req.ability.cannot(Action.Create, ScopedSubject(Folder, organizationId))
    ) {
      throw new UnauthorizedException('Cannot create folder');
    }

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
  @ApiOperation({ summary: 'Get all folders' })
  @ApiUnauthorizedResponse({
    description: 'Cannot read folders, requires "Read Folder" permission',
  })
  findAll(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<Folder[]> {
    if (
      req.ability.cannot(Action.Read, ScopedSubject(Folder, organizationId))
    ) {
      throw new UnauthorizedException('Cannot read folders');
    }

    return this.foldersService.findAllOfOrganization(organizationId);
  }

  @Get(':folderId')
  @ApiOperation({ summary: 'Get folder by ID' })
  @ApiUnauthorizedResponse({
    description: 'Cannot read folder, requires "Read Folder" permission',
  })
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('folderId') folderId: string,
  ): Promise<Folder> {
    if (
      req.ability.cannot(Action.Read, ScopedSubject(Folder, organizationId))
    ) {
      throw new UnauthorizedException('Cannot read folder');
    }

    return this.foldersService.findOne(organizationId, folderId);
  }

  @Patch(':folderId')
  @ApiOperation({ summary: 'Update folder by ID' })
  @ApiUnauthorizedResponse({
    description: 'Cannot update folder, requires "Update Folder" permission',
  })
  @ApiNotFoundResponse({ description: 'Parent folder not found' })
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('folderId') folderId: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ): Promise<Folder> {
    if (
      req.ability.cannot(Action.Update, ScopedSubject(Folder, organizationId))
    ) {
      throw new UnauthorizedException('Cannot update folder');
    }

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
  @ApiOperation({ summary: 'Delete folder by ID, and sub-folders recursively' })
  @ApiUnauthorizedResponse({
    description: 'Cannot delete folder, requires "Delete Folder" permission',
  })
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('folderId') folderId: string,
  ) {
    if (
      req.ability.cannot(Action.Delete, ScopedSubject(Folder, organizationId))
    ) {
      throw new UnauthorizedException('Cannot delete folder');
    }
    return this.foldersService.remove(organizationId, folderId, true);
  }

  // Folder Items

  @Put(':folderId/items/:itemId')
  @ApiOperation({ summary: 'Add item to folder' })
  @ApiUnauthorizedResponse({
    description:
      'Cannot add item to folder, requires "Update Folder" permission',
  })
  async addFolderItem(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('folderId') folderId: string,
    @Param('itemId') itemId: string,
    @Body() itemDto: FolderItemDto,
  ): Promise<FolderItem> {
    if (
      req.ability.cannot(Action.Update, ScopedSubject(Folder, organizationId))
    ) {
      throw new UnauthorizedException('Cannot add item to folder');
    }

    itemDto.folder = folderId;
    itemDto.organization = organizationId;
    itemDto.item = itemId;

    const item: FolderItem = await this.folderItemsService.findOne(
      organizationId,
      folderId,
      itemId,
    );

    if (!item) return this.folderItemsService.create(organizationId, itemDto);
    else return item;
  }

  @Get(':folderId/items')
  @ApiOperation({ summary: 'Get items of folder' })
  @ApiQuery({
    name: 'itemType',
    enum: FolderItemType,
    required: false,
    description: 'Filter items by type',
  })
  @ApiBadRequestResponse({
    description: 'Item type not supported, check FolderItemType',
  })
  @ApiQuery({
    name: 'recursive',
    required: false,
    description: 'Include items of sub-folders recursively',
  })
  @ApiUnauthorizedResponse({
    description:
      'Cannot get items of folder, requires "Read Folder" permission',
  })
  async getFolderItems(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('folderId') folderId: string,
    @Query('recursive') recursive: boolean,
    @Query('itemType') itemType?: FolderItemType,
  ): Promise<Array<Block>> {
    if (
      req.ability.cannot(Action.Read, ScopedSubject(Folder, organizationId)) ||
      req.ability.cannot(Action.Read, ScopedSubject(Block, organizationId))
    ) {
      throw new UnauthorizedException('Cannot get items of folder');
    }

    let items: FolderItem[];
    if (recursive) {
      items = await this.fetchAllFolderItems(organizationId, folderId, true);
    } else {
      items = await this.folderItemsService.findAllOfFolder(
        organizationId,
        folderId,
      );
    }

    console.log(items);
    console.log(itemType);

    if (itemType) items = items.filter((i) => i.type === itemType);

    // Maybe we should create an abstract type to handle plurality of items
    const itemsPopulated: any[] = [];

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
  @ApiOperation({
    summary: 'Remove item from folder by ID, does not delete item',
  })
  @ApiUnauthorizedResponse({
    description:
      'Cannot remove item from folder, requires "Update Folder" permission',
  })
  @ApiNotFoundResponse({ description: 'Folder or item not found' })
  async removeFolderItem(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('folderId') folderId: string,
    @Param('itemId') itemId: string,
  ) {
    if (
      req.ability.cannot(Action.Update, ScopedSubject(Folder, organizationId))
    ) {
      throw new UnauthorizedException('Cannot remove item from folder');
    }

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

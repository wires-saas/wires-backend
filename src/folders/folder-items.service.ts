import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FolderItem, FolderItemColl } from './schemas/folder-item.schema';
import { FolderItemDto } from './dto/folder-item.dto';
import { FolderItemType } from './entities/folder-item-type';
import { ExampleBlockIds } from '../blocks/entities/example-blocks';
import { DefaultFolderIds } from './entities/default-folders';

@Injectable()
export class FolderItemsService {
  private logger: Logger = new Logger(FolderItemsService.name);

  constructor(
    @InjectModel(FolderItemColl) private folderItemModel: Model<FolderItem>,
  ) {}

  create(organizationId: string, itemDto: FolderItemDto) {
    this.logger.log('Creating new folder item association');

    // TODO ensure resource isn't already associated with folder ?

    return new this.folderItemModel(
      new FolderItem({
        _id: {
          organization: organizationId,
          folder: itemDto.folder,
          item: itemDto.item,
        },
        type: itemDto.type,
      }),
    ).save();
  }

  findAll(): Promise<FolderItem[]> {
    return this.folderItemModel.find();
  }

  findAllOfType(type: FolderItemType): Promise<FolderItem[]> {
    return this.folderItemModel.find({
      type,
    });
  }

  findAllOfOrganization(organizationId: string): Promise<FolderItem[]> {
    return this.folderItemModel.find({
      '_id.organization': organizationId,
    });
  }

  findAllOfOrganizationAndType(
    organizationId: string,
    type: FolderItemType,
  ): Promise<FolderItem[]> {
    return this.folderItemModel.find({
      '_id.organization': organizationId,
      type,
    });
  }

  findOne(
    organizationId: string,
    folderId: string,
    itemId: string,
  ): Promise<FolderItem> {
    return this.folderItemModel.findOne({
      '_id.organization': organizationId,
      '_id.folder': folderId,
      '_id.item': itemId,
    });
  }

  findAllOfFolder(
    organizationId: string,
    folderId: string,
  ): Promise<FolderItem[]> {
    return this.folderItemModel.find({
      '_id.organization': organizationId,
      '_id.folder': folderId,
    });
  }

  remove(organizationId: string, folderId: string, itemId: string) {
    this.logger.log('Removing folder item association');
    return this.folderItemModel.deleteOne({
      '_id.organization': organizationId,
      '_id.folder': folderId,
      '_id.item': itemId,
    });
  }

  placeExampleBlocksInDefaultFolders(
    organizationId: string,
  ): Promise<FolderItem[]> {
    const folderItems = [
      new FolderItem({
        _id: {
          item: ExampleBlockIds.HEADER_1,
          folder: DefaultFolderIds.HEADERS,
          organization: organizationId,
        },
        type: FolderItemType.Block,
      }),
      new FolderItem({
        _id: {
          item: ExampleBlockIds.ARTICLE_1,
          folder: DefaultFolderIds.CONTENTS,
          organization: organizationId,
        },
        type: FolderItemType.Block,
      }),
      new FolderItem({
        _id: {
          item: ExampleBlockIds.FOOTER_1,
          folder: DefaultFolderIds.FOOTERS,
          organization: organizationId,
        },
        type: FolderItemType.Block,
      }),
    ];

    return this.folderItemModel.insertMany(folderItems);
  }
}

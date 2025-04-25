import { Injectable, Logger } from '@nestjs/common';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { Folder } from './schemas/folder.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomId } from '../shared/utils/db.utils';
import { DefaultFolderIds } from './entities/default-folders';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class FoldersService {
  private logger: Logger = new Logger(FoldersService.name);

  constructor(
    @InjectModel(Folder.name) private folderModel: Model<Folder>,
    private readonly i18n: I18nService,
  ) {}

  create(organizationId: string, createFolderDto: CreateFolderDto) {
    this.logger.log('Creating new folder');

    return new this.folderModel(
      new Folder({
        _id: {
          organization: organizationId,
          folder: randomId(),
        },
        displayName: createFolderDto.displayName,
        description: createFolderDto.description,
        parentFolder: createFolderDto.parentFolder,
      }),
    ).save();
  }

  findAll(): Promise<Folder[]> {
    return this.folderModel.find();
  }

  findAllOfOrganization(organizationId: string): Promise<Folder[]> {
    return this.folderModel.find({
      '_id.organization': organizationId,
    });
  }

  findOne(organizationId: string, folderId: string): Promise<Folder> {
    return this.folderModel.findOne({
      '_id.organization': organizationId,
      '_id.folder': folderId,
    });
  }

  findAllWithParent(
    organizationId: string,
    parentFolderId: string,
  ): Promise<Folder[]> {
    return this.folderModel.find({
      '_id.organization': organizationId,
      parentFolder: parentFolderId,
    });
  }

  update(
    organizationId: string,
    folderId: string,
    updateFolderDto: UpdateFolderDto,
  ) {
    this.logger.log('Updating existing folder');

    return this.folderModel.findOneAndUpdate(
      {
        '_id.organization': organizationId,
        '_id.folder': folderId,
      },
      {
        displayName: updateFolderDto.displayName,
        description: updateFolderDto.description,
        parentFolder: updateFolderDto.parentFolder,
      },
      { new: true },
    );
  }

  remove(organizationId: string, folderId: string, recursive: boolean) {
    // TODO delete all sub folders too
    this.logger.log('recursive', recursive);
    return this.folderModel.deleteOne({
      '_id.organization': organizationId,
      '_id.folder': folderId,
    });
  }

  createDefaultFolders(organizationId: string): Promise<Folder[]> {
    const defaultFolders = [
      new Folder({
        _id: {
          folder: DefaultFolderIds.HEADERS,
          organization: organizationId,
        },
        displayName: this.i18n.t('folders.headers.displayName'),
        description: this.i18n.t('folders.headers.description'),
        parentFolder: null,
      }),
      new Folder({
        _id: {
          folder: DefaultFolderIds.CONTENTS,
          organization: organizationId,
        },
        displayName: this.i18n.t('folders.contents.displayName'),
        description: this.i18n.t('folders.contents.description'),
        parentFolder: null,
      }),
      new Folder({
        _id: {
          folder: DefaultFolderIds.FOOTERS,
          organization: organizationId,
        },
        displayName: this.i18n.t('folders.footers.displayName'),
        description: this.i18n.t('folders.footers.description'),
        parentFolder: null,
      }),
    ];

    return this.folderModel.insertMany(defaultFolders);
  }
}

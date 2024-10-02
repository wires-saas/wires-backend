import { Injectable, Logger } from '@nestjs/common';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { Folder } from './schemas/folder.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomId } from '../shared/utils/db.utils';

@Injectable()
export class FoldersService {
  private logger: Logger = new Logger(FoldersService.name);

  constructor(@InjectModel(Folder.name) private folderModel: Model<Folder>) {}

  create(organizationId: string, createFolderDto: CreateFolderDto) {
    this.logger.log('Creating new folder');

    return new this.folderModel(
      new Folder({
        _id: {
          folder: randomId(),
          organization: organizationId,
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
      '_id.folder': folderId,
      '_id.organization': organizationId,
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
        '_id.folder': folderId,
        '_id.organization': organizationId,
      },
      {
        displayName: updateFolderDto.displayName,
        description: updateFolderDto.description,
        parentFolder: updateFolderDto.parentFolder,
      },
      { new: true },
    );
  }

  remove(id: number, recursive: boolean) {
    // TODO delete all sub folders too
    return `This action removes a #${id} folder ${recursive ? 'recursively' : ''}`;
  }
}

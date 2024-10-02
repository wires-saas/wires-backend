import { Injectable, Logger } from '@nestjs/common';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { Folder } from './schemas/folder.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomId } from '../shared/utils/db.utils';
import { Resource } from './schemas/resource.schema';
import { ResourceDto } from './dto/resource.dto';
import { ResourceType } from './entities/resource-type';

@Injectable()
export class ResourcesService {
  private logger: Logger = new Logger(ResourcesService.name);

  constructor(
    @InjectModel(Resource.name) private resourceModel: Model<Resource>,
  ) {}

  create(organizationId: string, resourceDto: ResourceDto) {
    this.logger.log('Creating new resource - folder association');

    // TODO ensure resource isn't already associated with folder ?

    return new this.resourceModel(
      new Resource({
        _id: {
          resource: resourceDto.resource,
          folder: resourceDto.folder,
          organization: organizationId,
        },
        type: resourceDto.type,
      }),
    ).save();
  }

  findAll(): Promise<Resource[]> {
    return this.resourceModel.find();
  }

  findAllOfType(type: ResourceType): Promise<Resource[]> {
    return this.resourceModel.find({
      type,
    });
  }

  findAllOfOrganization(organizationId: string): Promise<Resource[]> {
    return this.resourceModel.find({
      '_id.organization': organizationId,
    });
  }

  findAllOfOrganizationAndType(
    organizationId: string,
    type: ResourceType,
  ): Promise<Resource[]> {
    return this.resourceModel.find({
      '_id.organization': organizationId,
      type,
    });
  }

  findOne(
    organizationId: string,
    folderId: string,
    resourceId: string,
  ): Promise<Resource> {
    return this.resourceModel.findOne({
      '_id.organization': organizationId,
      '_id.folder': folderId,
      '_id.resource': resourceId,
    });
  }

  findAllOfFolder(
    organizationId: string,
    folderId: string,
  ): Promise<Resource[]> {
    return this.resourceModel.find({
      '_id.folder': folderId,
      '_id.organization': organizationId,
    });
  }

  remove(organizationId: string, folderId: string, resourceId: string) {
    this.logger.log('Removing resource - folder association', {
      folderId,
      resourceId,
    });
    return this.resourceModel.deleteOne({
      '_id.resource': resourceId,
      '_id.folder': folderId,
      '_id.organization': organizationId,
    });
  }
}

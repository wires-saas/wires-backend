import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomId } from '../shared/utils/db.utils';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { I18nService } from 'nestjs-i18n';
import { Template } from './schemas/template.schema';

@Injectable()
export class TemplatesService {
  private logger: Logger = new Logger(TemplatesService.name);

  constructor(
    @InjectModel(Template.name) private templateModel: Model<Template>,
    private readonly i18n: I18nService,
  ) {}

  create(
    organizationId: string,
    createBlockDto: CreateTemplateDto,
  ): Promise<Block> {
    this.logger.log('Creating new block');

    return new this.blockModel(
      new Block({
        _id: {
          block: randomId(),
          organization: organizationId,
          timestamp: Date.now(),
        },
        displayName: createBlockDto.displayName,
        description: createBlockDto.description,
        code: createBlockDto.code,
        wysiwygEnabled: createBlockDto.wysiwygEnabled,
        isArchived: false,
      }),
    ).save();
  }

  update(
    blockId: string,
    organizationId: string,
    updateBlockDto: UpdateTemplateDto,
  ): Promise<Block> {
    this.logger.log('Updating existing block');

    return new this.blockModel(
      new Block({
        _id: {
          block: blockId,
          organization: organizationId,
          timestamp: Date.now(),
        },
        displayName: updateBlockDto.displayName,
        description: updateBlockDto.description,
        code: updateBlockDto.code,
        wysiwygEnabled: updateBlockDto.wysiwygEnabled,
        isArchived: updateBlockDto.isArchived,
      }),
    ).save();
  }

  async updateIsArchived(
    blockId: string,
    organizationId: string,
    block: Block,
    isArchived: boolean,
  ): Promise<Block> {
    this.logger.log('Updating block isArchived');

    return new this.blockModel(
      new Block({
        _id: {
          block: blockId,
          organization: organizationId,
          timestamp: Date.now(),
        },
        displayName: block.displayName,
        description: block.description,
        code: block.code,
        wysiwygEnabled: block.wysiwygEnabled,
        isArchived: isArchived,
      }),
    ).save();
  }

  async findAllOfOrganization(organizationId: string): Promise<Block[]> {
    return this.blockModel
      .aggregate([
        { $match: { '_id.organization': organizationId } },
        { $sort: { '_id.timestamp': -1 } },
        { $group: { _id: '$_id.block', doc: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$doc' } },
        { $sort: { '_id.timestamp': -1 } },
      ])
      .then((blocks) => blocks.map((block) => new this.blockModel(block)));
  }

  findOne(organizationId: string, blockId: string): Promise<Block> {
    return this.blockModel.findOne(
      {
        '_id.block': blockId,
        '_id.organization': organizationId,
      },
      {},
      {
        sort: { '_id.timestamp': -1 },
      },
    );
  }

  remove(organizationId: string, blockId: string) {
    this.logger.log('Deleting block');
    return this.blockModel.deleteMany({
      '_id.block': blockId,
      '_id.organization': organizationId,
    });
  }
}

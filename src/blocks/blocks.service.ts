import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Block } from './schemas/block.schema';
import { randomId } from '../shared/utils/db.utils';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

@Injectable()
export class BlocksService {
  private logger: Logger = new Logger(BlocksService.name);

  constructor(@InjectModel(Block.name) private blockModel: Model<Block>) {}

  create(
    organizationId: string,
    createBlockDto: CreateBlockDto,
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
    updateBlockDto: UpdateBlockDto,
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

  createExampleBlocks(
    organizationId: string,
    domain: string,
  ): Promise<Block[]> {
    this.logger.log('Creating 3 example blocks');

    const exampleBlocks = [
      new Block({
        _id: {
          block: '670576bde8c905763f09657f',
          organization: organizationId,
          timestamp: Date.now(),
        },
        displayName: 'Header 1',
        description: 'Simple header with logo and organization title, centered',
        code:
          '<header>\n' +
          '    <img src="' +
          domain +
          '/assets/imgs/logo_purple.png" width="80" class="block m-auto"/>\n' +
          '    <h3 class="text-center">' +
          organizationId +
          '</h3>\n' +
          '</header>',
        wysiwygEnabled: false,
        isArchived: false,
        parameters: [],
      }),
    ];

    return this.blockModel.insertMany(exampleBlocks);
  }
}

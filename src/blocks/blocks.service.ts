import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Block } from './schemas/block.schema';
import { randomId } from '../shared/utils/db.utils';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

@Injectable()
export class BlocksService {
  private logger: Logger;

  constructor(@InjectModel(Block.name) private blockModel: Model<Block>) {
    this.logger = new Logger(BlocksService.name);
  }

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
      }),
    ).save();
  }

  findAllOfOrganization(organizationId: string): Promise<Block[]> {
    return this.blockModel
      .aggregate([
        { $match: { '_id.organization': organizationId } },
        { $sort: { '_id.timestamp': -1 } },
        { $group: { _id: '$block', doc: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$doc' } },
      ])
      .then((blocks) => blocks.map((block) => new this.blockModel(block)));
  }

  findOne(organizationId: string, blockId: string): Promise<Block> {
    return this.blockModel.findOne({
      '_id.block': blockId,
      '_id.organization': organizationId,
    });
  }

  remove(organizationId: string, blockId: string) {
    this.logger.log('Deleting block');
    return this.blockModel.deleteMany({
      '_id.block': blockId,
      '_id.organization': organizationId,
    });
  }
}

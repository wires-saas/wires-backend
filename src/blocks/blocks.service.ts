import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Block } from './schemas/block.schema';
import { CreateOrUpdateBlockDto } from './dto/create-or-update-block.dto';
import { randomId } from '../shared/utils/db.utils';

@Injectable()
export class BlocksService {
  private logger: Logger;

  constructor(@InjectModel(Block.name) private blockModel: Model<Block>) {
    this.logger = new Logger(BlocksService.name);
  }

  createOrUpdate(
    organizationId: string,
    createOrUpdateBlockDto: CreateOrUpdateBlockDto,
  ): Promise<Block> {
    if (!createOrUpdateBlockDto._id) {
      this.logger.log('Creating new block');
      return new this.blockModel(
        new Block({
          _id: {
            block: randomId(),
            organization: organizationId,
            timestamp: Date.now(),
          },
          displayName: createOrUpdateBlockDto.displayName,
          description: createOrUpdateBlockDto.description,
          code: createOrUpdateBlockDto.code,
          wysiwygEnabled: createOrUpdateBlockDto.wysiwygEnabled,
        }),
      ).save();
    } else {
      this.logger.log('Updating existing block');
      // TODO create new block with new id, to keep history
      // and allow rollback to previous versions

      // TODO version = int incremented ? not timestamp already in updatedAt ?

      return new this.blockModel(
        new Block({
          _id: {
            block: createOrUpdateBlockDto._id,
            organization: organizationId,
            timestamp: Date.now(),
          },
          displayName: createOrUpdateBlockDto.displayName,
          description: createOrUpdateBlockDto.description,
          code: createOrUpdateBlockDto.code,
          wysiwygEnabled: createOrUpdateBlockDto.wysiwygEnabled,
        }),
      ).save();
    }
  }

  findAllOfOrganization(organizationId: string): Promise<Block[]> {
    return this.blockModel
      .aggregate([
        { $match: { '_id.organization': organizationId } },
        { $sort: { '_id.timestamp': -1 } },
        { $group: { _id: '$block', doc: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$doc' } },
      ])
      .then((blocks) => {
        console.log(blocks);
        const t = blocks.map((block) => new this.blockModel(block));
        console.log(t);
        return t;
        // return blocks.map((block) => new Block({ ...block }));
      });
  }

  findOne(organizationId: string, blockId: string): Promise<Block> {
    return this.blockModel.findOne({
      organization: organizationId,
      _id: blockId,
    });
  }

  update(block: Block) {
    return this.blockModel
      .findOneAndUpdate({ _id: block._id }, block, { new: true })
      .exec();
  }

  remove(organizationId: string, blockId: string) {
    return this.blockModel.deleteOne({
      organization: organizationId,
      _id: blockId,
    });
  }
}

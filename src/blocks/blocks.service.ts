import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Block } from './schemas/block.schema';
import { CreateOrUpdateBlockDto } from './dto/create-or-update-block.dto';

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
      return new this.blockModel(
        new Block({
          displayName: createOrUpdateBlockDto.displayName,
          description: createOrUpdateBlockDto.description,
          code: createOrUpdateBlockDto.code,
          organization: organizationId,
        }),
      ).save();
    } else {
      const block = new Block({
        _id: createOrUpdateBlockDto._id,
        organization: organizationId,
        displayName: createOrUpdateBlockDto.displayName,
        description: createOrUpdateBlockDto.description,
        code: createOrUpdateBlockDto.code,
      });

      return this.update(block);
    }
  }

  findAllOfOrganization(organizationId: string): Promise<Block[]> {
    return this.blockModel
      .find({
        organization: organizationId,
      })
      .exec();
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

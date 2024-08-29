import { Injectable } from '@nestjs/common';
import { CreateOrUpdateTagDto } from './dto/create-tag.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag } from './schemas/tag.schema';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag.name)
    private tagModel: Model<Tag>,
  ) {}

  createOrUpdate(tag: Tag): Promise<Tag> {
    if (!tag._id) {
      return new this.tagModel(tag).save();
    } else {
      return this.tagModel
        .findOneAndUpdate({ _id: tag._id }, tag, { new: true })
        .exec();
    }
  }

  findAll(): Promise<Tag[]> {
    return this.tagModel.find().exec();
  }

  findOne(id: string): Promise<Tag> {
    return this.tagModel.findById(id);
  }

  remove(id: string): Promise<Tag> {
    return this.tagModel.findByIdAndDelete(id);
  }
}

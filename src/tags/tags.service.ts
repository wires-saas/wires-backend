import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag } from './schemas/tag.schema';
import { ArticlesService } from '../articles/articles.service';
import { Article } from '../articles/schemas/article.schema';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag.name)
    private tagModel: Model<Tag>,
    private articleService: ArticlesService,
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

  findAllOfOrganization(organizationId: string): Promise<Tag[]> {
    return this.tagModel.find({ organization: organizationId }).exec();
  }

  findAll(): Promise<Tag[]> {
    return this.tagModel.find().exec();
  }

  findOne(organizationId: string, tagId: string): Promise<Tag> {
    return this.tagModel
      .findOne({ _id: tagId, organization: organizationId })
      .exec();
  }

  async remove(tag: Tag): Promise<Tag> {
    await this.articleService.removeAllArticleTag(tag.organization, tag._id);

    return this.tagModel.findOneAndDelete({
      _id: tag._id,
      organization: tag.organization,
    });
  }

  async applyTagRules(tag: Tag): Promise<Article[]> {
    // apply tag rules to articles
    return await this.articleService.updateAllArticleTag(
      tag.organization,
      tag._id,
      tag.ruleset,
    );
  }
}

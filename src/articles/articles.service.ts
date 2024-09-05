import { Injectable, Logger } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { Article } from './schemas/article.schema';
import { Feed } from '../feeds/schemas/feed.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TagRule } from '../tags/schemas/tag-rule.schema';
import { TagUtils } from '../shared/utils/tag.utils';
import * as util from 'util';

@Injectable()
export class ArticlesService {
  private logger: Logger;
  constructor(@InjectModel(Article.name) private articleModel: Model<Article>) {
    this.logger = new Logger(ArticlesService.name);
  }

  create(createArticleDto: CreateArticleDto) {
    return new this.articleModel(
      new Article({
        ...createArticleDto,
        stats: { sent: 0, displayed: 0, clicked: 0 },
        tags: [],
      }),
    ).save();
  }

  createMany(createArticleDtos: CreateArticleDto[]): Promise<Article[]> {
    return this.articleModel.insertMany(
      createArticleDtos.map((dto) => {
        return new Article({
          ...dto,
          stats: { sent: 0, displayed: 0, clicked: 0 },
          tags: [],
        });
      }),
      { ordered: false },
    );
  }

  async findNewUrls(urls: string[]): Promise<string[]> {
    return this.articleModel
      .find({ url: { $in: urls } }, { url: 1 })
      .then((articles) =>
        urls.filter((url) => !articles.some((a) => a.url === url)),
      );
  }

  findAll(feeds: Feed[]): Promise<Article[]> {
    return this.articleModel
      .find({ feeds: { $in: feeds.map((feed) => feed._id) } })
      .exec();
  }

  findAllOfOrganization(organizationId: string): Promise<Article[]> {
    return this.articleModel.find({ organization: organizationId }).exec();
  }

  findAllFromFeed(feedId: string): Promise<Article[]> {
    return this.articleModel.find({ feeds: { $in: [feedId] } }).exec();
  }

  async updateAll(tagId: any, rules: TagRule[]): Promise<Article[]> {
    this.logger.log('Removing tag from articles with it');
    await this.articleModel
      .updateMany({ tags: tagId }, { $pull: { tags: tagId } })
      .exec();

    this.logger.debug(rules);
    const query = rules.reduce((res, acc) => {
      const subQuery = TagUtils.ruleToMongoQuery(acc);
      return { ...res, ...subQuery };
    }, {});

    this.logger.debug(util.inspect(query, true, 10));

    this.logger.log('Finding articles matching tag rules');
    const articles = await this.articleModel.find(query).exec();
    const articleIds = articles.map((a) => a._id);

    this.logger.log('Updating articles with tag');
    await this.articleModel
      .updateMany({ _id: { $in: articleIds } }, { $addToSet: { tags: tagId } })
      .exec();

    return articles;
  }

  findOne(id: number) {
    return `This action returns a #${id} article`;
  }

  remove(id: number) {
    return `This action removes a #${id} article`;
  }
}

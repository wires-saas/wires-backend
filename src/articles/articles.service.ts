import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './schemas/article.schema';
import { Feed } from '../feeds/schemas/feed.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
  ) {}

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

  findAllFromFeed(feedId: string): Promise<Article[]> {
    return this.articleModel.find({ feeds: { $in: [feedId] } }).exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} article`;
  }

  update(id: number, updateArticleDto: UpdateArticleDto) {
    return `This action updates a #${id} article`;
  }

  remove(id: number) {
    return `This action removes a #${id} article`;
  }
}

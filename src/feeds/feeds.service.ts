import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { Feed } from './schemas/feed.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScrapingAuthorizationType } from './entities/scraping.entity';
import { HashService } from '../services/security/hash.service';
import { MongoAbility } from '@casl/ability';
import { accessibleBy } from '@casl/mongoose';
import { ArticlesService } from '../articles/articles.service';

@Injectable()
export class FeedsService {
  private logger: Logger;

  constructor(
    @InjectModel(Feed.name) private feedModel: Model<Feed>,
    private articlesService: ArticlesService,
    private hashService: HashService,
  ) {
    this.logger = new Logger(FeedsService.name);
  }

  private async convertToEntity(
    organizationId: string,
    createFeedDto: CreateFeedDto,
  ): Promise<Feed> {
    let authorizationTokenHashed = undefined;
    if (createFeedDto.authorizationToken) {
      authorizationTokenHashed = await this.hashService.hash(
        createFeedDto.authorizationToken,
      );
    }

    return new Feed({
      displayName: createFeedDto.displayName,
      description: createFeedDto.description,
      organization: organizationId,

      urls: createFeedDto.urls.map((url) => url.trim()),

      scrapingEnabled: true,
      scrapingInterval: createFeedDto.scrapingInterval,
      scrapingGranularity: createFeedDto.scrapingGranularity,

      autoScrapingInterval: createFeedDto.scrapingInterval,
      autoScrapingGranularity: createFeedDto.scrapingGranularity,

      authorizationType:
        createFeedDto.authorizationType || ScrapingAuthorizationType.NONE,

      authorizationUsername: createFeedDto.authorizationUsername,
      authorizationToken: authorizationTokenHashed,
    });
  }

  async create(organizationId: string, createFeedDto: CreateFeedDto) {
    const feed = await this.convertToEntity(organizationId, createFeedDto);

    return new this.feedModel(feed).save();
  }

  async findAll(organizationId: string): Promise<Feed[]> {
    this.logger.log('Fetching all feeds for organization ' + organizationId);
    const feeds: Feed[] = await this.feedModel
      .find({ organization: organizationId })
      .exec();

    for (const feed of feeds) {
      const articles = await this.articlesService.findAllFromFeed(feed._id);
      feed.totalArticles = articles.length;
    }

    return feeds;
  }

  findOne(feedId: string): Promise<Feed> {
    return this.feedModel.findById(feedId).exec();
  }

  async findOneWithAbility(
    feedId: string,
    ability: MongoAbility,
  ): Promise<Feed> {
    return this.feedModel
      .findOne({
        $and: [{ _id: feedId }, accessibleBy(ability, 'read').ofType(Feed)],
      })
      .exec()
      .then((feed) => {
        if (!feed) throw new NotFoundException('Feed not found');
        return feed;
      });
  }

  async update(feedId: string, updateFeedDto: UpdateFeedDto) {
    if (updateFeedDto.authorizationToken) {
      updateFeedDto.authorizationToken = await this.hashService.hash(
        updateFeedDto.authorizationToken,
      );
    }

    return this.feedModel.findByIdAndUpdate(
      feedId,
      new Feed({
        ...updateFeedDto,
      }),
      { returnOriginal: false },
    );
  }

  remove(feedId: string) {
    return this.feedModel.findByIdAndDelete(feedId).exec();
  }
}

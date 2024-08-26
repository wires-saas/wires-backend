import { Injectable, Logger } from '@nestjs/common';
import {
  ScrapingResultTimed,
  ScrapingService,
} from '../../services/scraping/scraping.service';
import { Feed } from '../schemas/feed.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeedRun } from '../schemas/feed-run.schema';
import { FeedRunStatus } from '../entities/feed-run.entity';

@Injectable()
export class FeedRunsService {
  private logger: Logger;
  constructor(
    private scrapingService: ScrapingService,
    @InjectModel(FeedRun.name) private feedRunModel: Model<FeedRun>,
  ) {
    this.logger = new Logger(FeedRunsService.name);
  }

  findAllRunsOfFeeds(feeds: Feed[]): Promise<FeedRun[]> {
    return this.feedRunModel
      .find({ feed: { $in: feeds.map((feed) => feed._id) } })
      .exec();
  }

  async runFeed(feed: Feed): Promise<FeedRun> {
    console.log(feed);

    // Creation of pending feed run
    const feedRun = await new this.feedRunModel({
      feed: feed._id,
      status: FeedRunStatus.PENDING,
    }).save();

    console.log(feedRun);

    const scrapingRequests: Array<Promise<ScrapingResultTimed>> = feed.urls.map(
      async (url) => {
        this.logger.log(`Scraping ${url}`);
        try {
          return await this.scrapingService.scrape(url);
        } catch (error) {
          this.logger.error(`Error while scraping ${url}`, error);
          return null as ScrapingResultTimed;
        }
      },
    );

    return Promise.all(scrapingRequests)
      .then((results) => {
        const successfulRequests: number = results.filter(
          (result) => result !== null,
        )?.length;

        const aggregatedScrapingResult: ScrapingResultTimed = results.reduce(
          (acc, result) => {
            if (result === null) return acc;
            else if (acc === null) return result;
            else {
              return {
                articles: [...acc.articles, ...result.articles],
                articlesMissed: [
                  ...acc.articlesMissed,
                  ...result.articlesMissed,
                ],
                articleScore: acc.articleScore + result.articleScore,
                metadataScore: acc.metadataScore + result.metadataScore,
                startedAt: Math.min(acc.startedAt, result.startedAt),
                endedAt: Math.max(acc.endedAt, result.endedAt),
                duration: acc.duration + result.duration,
              };
            }
          },
          null as ScrapingResultTimed,
        );

        aggregatedScrapingResult.articleScore /= successfulRequests;
        aggregatedScrapingResult.metadataScore /= successfulRequests;

        return aggregatedScrapingResult;
      })
      .then(async (result) => {
        this.logger.log('Scraping completed');
        feedRun.status = FeedRunStatus.COMPLETED;
        feedRun.newArticles = result.articles.map((article) => article.url);
        feedRun.duplicateArticles = [];
        feedRun.durationMs = result.duration;
        return feedRun.save();
      });

    // TODO Add the run to the database
    // The run will contain aggregated scraping results without full articles (only keeping URLs)
    // A run is strongly related to a feed

    // The articles will be stored in a separate collection
  }

  findAllRunsOfFeed(feedId: string): Promise<FeedRun[]> {
    return this.feedRunModel.find({ feed: feedId }).exec();
  }

  findRunOfFeed(feedId: string, runId: string): Promise<FeedRun> {
    return this.feedRunModel.findOne({ feed: feedId, _id: runId }).exec();
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ScrapingService } from '../../services/scraping/scraping.service';
import { Feed } from '../schemas/feed.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeedRun, FeedRunColl } from '../schemas/feed-run.schema';
import { FeedRunStatus } from '../entities/feed-run.entity';
import { ArticlesService } from '../../articles/articles.service';
import {
  ScrapedArticle,
  ScrapingResultTimed,
} from '../../services/scraping/scraping.entities';

@Injectable()
export class FeedRunsService {
  private logger: Logger;
  constructor(
    private articlesService: ArticlesService,
    private scrapingService: ScrapingService,
    @InjectModel(FeedRunColl) private feedRunModel: Model<FeedRun>,
  ) {
    this.logger = new Logger(FeedRunsService.name);
  }

  findAllRunsOfFeeds(feeds: Feed[]): Promise<FeedRun[]> {
    return this.feedRunModel
      .find({ feed: { $in: feeds.map((feed) => feed._id) } })
      .populate('feed')
      .exec();
  }

  async runFeed(feed: Feed): Promise<FeedRun> {
    // 1) Creation of pending feed run
    const feedRun = await new this.feedRunModel({
      feed: feed._id,
      status: FeedRunStatus.PENDING,
    }).save();

    // 2) Setup scraping of each URL with error handling
    const scrapingRequests: Array<Promise<ScrapingResultTimed>> = feed.urls.map(
      async (url) => {
        try {
          return await this.scrapingService.scrape(
            url,
            feed.scraperType,
            feed.scraperOptions,
          );
        } catch (error) {
          this.logger.error(`Error while scraping ${url}`, error);
          return null as ScrapingResultTimed;
        }
      },
    );

    // 3) Scraping and aggregation of results
    return Promise.all(scrapingRequests)
      .then((results: ScrapingResultTimed[]) => {
        // failed scraping requests are represented as null
        const successfulRequests: number = results.filter(
          (result) => result !== null,
        )?.length;

        // generate aggregated scraping result
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

        if (aggregatedScrapingResult && successfulRequests > 0) {
          aggregatedScrapingResult.articleScore /= successfulRequests;
          aggregatedScrapingResult.metadataScore /= successfulRequests;

          // remove duplicates
          aggregatedScrapingResult.articles = [
            ...new Set(aggregatedScrapingResult.articles),
          ];
          aggregatedScrapingResult.articlesMissed = [
            ...new Set(aggregatedScrapingResult.articlesMissed),
          ];
        }

        return aggregatedScrapingResult;
      })
      .then(async (result: ScrapingResultTimed) => {
        // 4) Update feed run with scraping results

        if (!result) {
          this.logger.error('Scraping failed');
          feedRun.status = FeedRunStatus.FAILED;
          return feedRun.save();
        } else {
          this.logger.log('Scraping completed');

          // Add new articles to the database
          // From articles collection, feed run is idempotent

          const articleCreationStartedAt = Date.now();

          const newUrls: string[] = await this.articlesService.findNewUrls(
            result.articles.map((article) => article.url),
          );
          this.logger.debug(newUrls);

          const newArticles: ScrapedArticle[] = result.articles.filter(
            (article) => newUrls.includes(article.url),
          );

          const createdArticles = await this.articlesService.createMany(
            newArticles.map((article) => ({
              ...article,
              organization: feed.organization,
              feeds: [feedRun.feed],
            })),
          );

          const articleCreationEndedAt = Date.now();

          this.logger.log(`Created ${createdArticles.length} new articles`);

          // TODO Update existing articles ?

          feedRun.status = FeedRunStatus.COMPLETED;
          feedRun.articles = result.articles.map((article) => article.url);
          feedRun.newArticles = createdArticles.map((article) => article.url);
          feedRun.scrapingDurationMs = result.duration;
          feedRun.articlesCreationMs =
            articleCreationEndedAt - articleCreationStartedAt;

          return feedRun.save();
        }
      })
      .catch((error) => {
        this.logger.error('Error while running feed', error);
        feedRun.status = FeedRunStatus.FAILED;
        return feedRun.save();
      });
  }

  findAllRunsOfFeed(feedId: string): Promise<FeedRun[]> {
    return this.feedRunModel.find({ feed: feedId }).exec();
  }

  async findRunOfFeed(feedId: string, runId: string): Promise<FeedRun> {
    return this.feedRunModel
      .findOne({ feed: feedId, _id: runId })
      .populate('articles')
      .exec();
  }
}

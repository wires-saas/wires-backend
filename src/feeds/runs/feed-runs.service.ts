import { Injectable, Logger } from '@nestjs/common';
import {
  ScrapingResultTimed,
  ScrapingService,
} from '../../services/scraping/scraping.service';
import { FeedsService } from '../feeds.service';
import { Feed } from '../schemas/feed.schema';

@Injectable()
export class FeedRunsService {
  private logger: Logger;
  constructor(private scrapingService: ScrapingService) {
    this.logger = new Logger(FeedRunsService.name);
  }

  findAllRunsOfOrganization(organizationId: string) {
    return `This action returns all runs of organization #${organizationId}`;
  }

  async runFeed(feed: Feed) {
    console.log(feed);

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

    return Promise.all(scrapingRequests).then((results) => {
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
              articlesMissed: [...acc.articlesMissed, ...result.articlesMissed],
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
    });

    // TODO Add the run to the database
    // The run will contain aggregated scraping results without full articles (only keeping URLs)
    // A run is strongly related to a feed

    // The articles will be stored in a separate collection
  }

  findAllRunsOfFeed(feedId: string) {
    return `This action returns all runs of feed #${feedId}`;
  }

  findRunOfFeed(feedId: string, runId: string) {
    return `This action returns run #${runId} of feed #${feedId}`;
  }
}

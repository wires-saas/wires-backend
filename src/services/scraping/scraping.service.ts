import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Scraper, ScraperType, ScrapingResultTimed } from './scraping.entities';
import { DefaultScraper } from './default-scraper';
import { ScraperOptions } from '../../feeds/schemas/scraper-options.schema';

@Injectable()
export class ScrapingService {
  private readonly logger: Logger;

  constructor(private httpService: HttpService) {
    this.logger = new Logger(ScrapingService.name);
  }

  async scrape(
    url: string,
    scraperType: ScraperType,
    scraperOptions: ScraperOptions,
  ): Promise<ScrapingResultTimed> {
    let scraper: Scraper;

    switch (scraperType) {
      case ScraperType.DEFAULT:
        this.logger.log('Using default scraper');
        scraper = new DefaultScraper(
          this.httpService,
          this.logger,
          scraperOptions,
        );
        break;
      default:
        throw new Error('Unknown scraper type');
    }

    return scraper.scrape(url);
  }
}

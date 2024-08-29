import {
  Scraper,
  ScrapingResult,
  ScrapingResultTimed,
} from './scraping.entities';
import { firstValueFrom } from 'rxjs';
import * as xml2js from 'xml2js';
import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ScraperOptions } from '../../feeds/schemas/scraper-options.schema';

export class DefaultScraper implements Scraper {
  async scrape(url: string): Promise<ScrapingResultTimed> {
    const startedAt = Date.now();

    try {
      const response = await firstValueFrom(this.httpService.get(url));

      let scrapingResult: ScrapingResult;

      const type = this.guessDataType(response.data);
      switch (type) {
        case 'json':
          scrapingResult = await this.scrapeJSON(response.data);
          break;
        case 'xml':
          scrapingResult = await this.scrapeXML(response.data);
          break;
        default:
          throw new Error('Unknown data type');
      }

      const endedAt = Date.now();

      return {
        ...scrapingResult,
        startedAt,
        endedAt,
        duration: endedAt - startedAt,
      };
    } catch (error) {
      this.logger.error('Error while scraping', error);
      throw error;
    }
  }

  private guessDataType(data: string): 'json' | 'xml' {
    if (data.startsWith('<?xml')) {
      return 'xml';
    } else {
      JSON.parse(data);
      return 'json';
    }
  }

  private async scrapeXML(data: string): Promise<ScrapingResult> {
    // Parse XML
    const xml = await xml2js.parseStringPromise(data);

    const items = xml['rss']['channel'][0]['item'];

    const articlesMissed = [];
    const articles = items
      .map((item) => {
        try {
          return this.convertItemToArticle(item);
        } catch (e) {
          this.logger.error('Error while converting item to article');
          articlesMissed.push(item);
          return null;
        }
      })
      .filter((article) => article !== null);

    const articleScore =
      (articles.length / (articles.length + articlesMissed.length)) * 100;

    const maxMetadata: number = 8;
    const metadataScore =
      (articles
        .map((article) => Object.keys(article.metadata).length)
        .reduce((a, b) => a + b, 0) /
        (articles.length * maxMetadata)) *
      100;

    return {
      articles,
      articlesMissed,
      articleScore,
      metadataScore,
    };
  }

  private scrapeJSON(data: string): Promise<ScrapingResult> {
    console.log(data);
    return null;
  }

  private convertItemToArticle(item: any) {
    const url = item.link[0];

    let title: string | undefined;
    try {
      title = item.title[0];
    } catch (e) {
      this.logger.warn('Cannot extract title');
    }

    let description: string | undefined;
    try {
      description = item.description[0];
    } catch (e) {
      this.logger.warn('Cannot extract description');
    }

    let image: string | undefined;
    try {
      image = item['media:content'][0]['$']['url'];
    } catch (e) {
      this.logger.warn('Cannot extract image');
    }

    let thumbnail: string | undefined;
    try {
      thumbnail = item['media:content'][0]['media:thumbnail'][0]['$']['url'];
    } catch (e) {
      this.logger.warn('Cannot extract thumbnail');
    }

    let link: string | undefined;
    try {
      link = item.link[0];
    } catch (e) {
      this.logger.warn('Cannot extract link');
    }

    let categories: string[] | undefined;
    try {
      categories = item.category;
    } catch (e) {
      this.logger.warn('Cannot extract categories');
    }

    let publishedAt: number | string | undefined;
    try {
      publishedAt = item.pubDate[0];
      publishedAt = new Date(publishedAt).getTime();
    } catch (e) {
      this.logger.warn('Cannot extract publishedAt');
    }

    let author: string | undefined;
    try {
      author = item['dc-creator'][0];
      author = author.replaceAll('"', '');
      author = author.replaceAll('\\', '');
    } catch (e) {
      this.logger.warn('Cannot extract author');
    }

    const article = {
      url,

      metadata: {
        title,
        description,
        image,
        thumbnail,
        link,
        categories,
        publishedAt,
        author,
      },
    };

    Object.keys(article.metadata).forEach((key) => {
      if (article.metadata[key] === undefined) {
        delete article.metadata[key];
      }
    });

    return article;
  }

  private logger: Logger;
  private httpService: HttpService;

  options: ScraperOptions;

  constructor(
    httpService: HttpService,
    logger: Logger,
    options: ScraperOptions,
  ) {
    this.httpService = httpService;
    this.logger = logger;
    this.options = options;
  }
}

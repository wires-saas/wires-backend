import { Article } from '../../articles/schemas/article.schema';
import { ScraperOptions } from '../../feeds/schemas/scraper-options.schema';

export enum ScraperType {
  DEFAULT = 'DEFAULT',
}

export type ScrapedArticle = Pick<Article, 'url' | 'metadata'>;

export interface Scraper {
  scrape: (url: string) => Promise<ScrapingResultTimed>;
  options: ScraperOptions;
}

export interface ScrapingResult {
  articles: ScrapedArticle[];
  articlesMissed: ScrapedArticle[];
  articleScore: number;
  metadataScore: number;
}

export interface ScrapingResultTimed extends ScrapingResult {
  startedAt: number;
  endedAt: number;
  duration: number;
}

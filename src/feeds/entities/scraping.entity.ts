export type ScrapingGranularity = 'day' | 'hour' | 'minute';

export enum ScrapingAuthorizationType {
  BASIC = 'basic',
  BEARER = 'bearer',
  API_KEY = 'apikey',
  NONE = 'none',
}

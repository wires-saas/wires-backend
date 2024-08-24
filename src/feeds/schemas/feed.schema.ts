import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  ScrapingAuthorization,
  ScrapingGranularity,
} from '../entities/scraping.entity';

export type FeedDocument = HydratedDocument<Feed>;

@Schema({
  timestamps: true,
  toObject: {
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      delete ret.authorizationToken;
      delete ret.authorizationUsername;
      return ret;
    },
  },
  toJSON: {
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      delete ret.authorizationToken;
      delete ret.authorizationUsername;
      return ret;
    },
  },
})
export class Feed {
  _id: string;

  @Prop({
    required: true,
    type: String,
    ref: 'Organization',
  })
  organization: string;

  @Prop({ required: true, type: String }) // not specify it will throw, resulting in error 500
  displayName: string;

  @Prop({ required: true, type: [String] })
  urls: string[];

  @Prop()
  scrapingFrequency: number;

  @Prop()
  scrapingGranularity: ScrapingGranularity;

  @Prop()
  scrapingEnabled: boolean;

  @Prop()
  autoScrapingFrequency: number;

  @Prop()
  autoScrapingGranularity: ScrapingGranularity;

  @Prop()
  autoScrapingEnabled: boolean;

  @Prop({ default: 'none' })
  authorization?: ScrapingAuthorization;

  @Prop()
  authorizationUsername?: string;

  @Prop()
  authorizationToken?: string;

  constructor(partial: Partial<Feed>) {
    Object.assign(this, partial);
  }
}

export const FeedSchema = SchemaFactory.createForClass(Feed);

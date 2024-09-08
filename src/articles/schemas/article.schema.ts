import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ArticleMetadata } from './article-metadata.schema';
import { ArticleStats } from './article-stats.schema';

export type ArticleDocument = HydratedDocument<Article>;

@Schema({
  timestamps: true,
  toObject: {
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      delete ret._id;
      return ret;
    },
  },
  toJSON: {
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      delete ret._id;
      return ret;
    },
  },
})
export class Article {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true, unique: true })
  url: string;

  @Prop({
    required: true,
    type: String,
    ref: 'Organization',
  })
  organization: string;

  @Prop({
    required: true,
    type: [String],
    ref: 'Feed',
  })
  feeds: string[];

  @Prop({ type: [String] })
  tags: string[];

  @Prop({
    type: ArticleMetadata,
    default: {},
  })
  metadata: ArticleMetadata;

  @Prop({ type: ArticleStats, default: { sent: 0, displayed: 0, clicked: 0 } })
  stats: ArticleStats;

  constructor(partial: Partial<Article>) {
    Object.assign(this, partial);
    if (!partial._id) {
      this._id = this.url;
    }
  }
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

ArticleSchema.index({ 'metadata.publishedAt': 1 });

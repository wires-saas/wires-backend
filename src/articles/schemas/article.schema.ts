import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ArticleMetadata, ArticleStats } from '../entities/article.entity';

export type ArticleDocument = HydratedDocument<Article>;

@Schema({
  timestamps: true,
  toObject: {
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      return ret;
    },
  },
  toJSON: {
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      return ret;
    },
  },
})
export class Article {
  _id: string;

  @Prop({ required: true, unique: true })
  url: string;

  @Prop({
    required: true,
    type: [String],
    ref: 'Feed',
  })
  feeds: string[];

  @Prop({ type: [String] })
  tags: string[];

  @Prop()
  metadata: ArticleMetadata;

  @Prop({ default: { sent: 0, displayed: 0, clicked: 0 } })
  stats: ArticleStats;

  constructor(partial: Partial<Article>) {
    Object.assign(this, partial);
  }
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FeedRunStatus } from '../entities/feed-run.entity';

export type FeedRunDocument = HydratedDocument<FeedRun>;

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
export class FeedRun {
  _id: string;

  @Prop({
    required: true,
    type: String,
    ref: 'Feed',
  })
  feed: string;

  @Prop({ type: FeedRunStatus })
  status: FeedRunStatus;

  @Prop()
  newArticles: string[];

  @Prop()
  duplicateArticles: string[];

  @Prop()
  durationMs: number;

  constructor(partial: Partial<FeedRun>) {
    Object.assign(this, partial);
  }
}

export const FeedRunSchema = SchemaFactory.createForClass(FeedRun);

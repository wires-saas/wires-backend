import { Prop, Schema } from '@nestjs/mongoose';

@Schema({
  timestamps: false,
  versionKey: false,
  _id: false,
})
export class ArticleMetadata {
  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  image: string;

  @Prop({ type: [String] })
  categories: string[];

  @Prop({ type: Number })
  publishedAt: number;

  @Prop({ type: String })
  author: string;
}

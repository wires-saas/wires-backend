import { Prop, Schema } from '@nestjs/mongoose';

@Schema({
  timestamps: false,
  versionKey: false,
  _id: false,
})
export class ArticleStats {
  @Prop({ default: 0 })
  sent: number;

  @Prop({ default: 0 })
  displayed: number;

  @Prop({ default: 0 })
  clicked: number;
}

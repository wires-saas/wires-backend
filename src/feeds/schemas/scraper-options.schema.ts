import { Prop, Schema } from '@nestjs/mongoose';

@Schema({
  timestamps: false,
  versionKey: false,
  _id: false,
})
export class ScraperOptions {
  @Prop({ default: true })
  cleanNbsp?: boolean;
}

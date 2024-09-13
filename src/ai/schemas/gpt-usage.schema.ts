import { Prop, Schema } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
  _id: false,
})
export class GptUsage {
  @Prop({ type: Number, default: 0 })
  requestsUsage: number;

  @Prop({ type: Number, default: 0 })
  requestsLimit: number;

  @Prop()
  requestsLimitReset?: Date;

  @Prop({ type: Number, default: 0 })
  tokensUsage: number;

  @Prop({ type: Number, default: 0 })
  tokensLimit: number;

  @Prop()
  tokensLimitReset?: Date;

  @Prop()
  lastRequest?: Date;

  @Prop()
  lastRequestStatusCode?: string;

  isAvailable?: boolean;
}

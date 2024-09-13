import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GptRequestStatus } from '../entities/ai.entities';

export type GptRequestDocument = HydratedDocument<GptRequest>;

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
    getters: false,
  },
})
export class GptRequest {
  _id: string;

  @Prop({
    required: true,
    type: String,
    ref: 'Gpt',
  })
  gpt: string;

  @Prop({ type: String })
  prompt: string;

  @Prop({ type: String })
  response: string;

  @Prop({ type: String })
  status: GptRequestStatus;

  @Prop({ type: Number })
  inputTokens: number;

  @Prop({ type: Number })
  outputTokens: number;

  @Prop({ type: Number })
  totalTokens: number;

  constructor(partial: Partial<GptRequest>) {
    Object.assign(this, partial);
  }
}

export const GptRequestColl: string = 'gpt_requests';

export const GptRequestSchema = SchemaFactory.createForClass(GptRequest);

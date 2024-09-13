import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GptGenerationResult, SupportedGPT } from '../entities/ai.entities';
import { GptUsage } from './gpt-usage.schema';
import { AiUtils } from '../../shared/utils/ai.utils';
import { GptAuthentication } from './gpt-authentication.schema';

export type GptDocument = HydratedDocument<Gpt>;

@Schema({
  timestamps: true,
  toObject: {
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      return ret;
    },
    getters: true,
  },
  toJSON: {
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      delete ret._id;
      delete ret.createdAt;
      delete ret.updatedAt;
      delete ret.usage.createdAt;
      delete ret.authentication.apiKey;
      return ret;
    },
    getters: true,
  },
  virtuals: {
    website: {
      get(): string {
        return AiUtils.getWebsite(this.type);
      },
    },
    terms: {
      get(): string {
        return AiUtils.getTerms(this.type);
      },
    },
    canRequest: {
      get(): boolean {
        return (
          this.usage.requestsUsage < this.usage.requestsLimit &&
          this.usage.tokensUsage < this.usage.tokensLimit
        );
      },
    },
  },
})
export class Gpt {
  _id: string;

  @Prop({ type: String, required: true })
  model: SupportedGPT;

  @Prop({
    required: true,
    type: String,
    ref: 'Organization',
  })
  organization: string;

  @Prop({ type: GptUsage })
  usage: GptUsage;

  @Prop({ type: GptAuthentication })
  authentication: GptAuthentication;

  website: string; // virtual
  terms: string; // virtual
  canRequest: boolean; // virtual

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  request(prompt: string): Promise<GptGenerationResult> {
    throw new Error('Method not implemented.');
  }

  constructor(partial: Partial<Gpt>) {
    Object.assign(this, partial);
  }
}

export const GptSchema = SchemaFactory.createForClass(Gpt);

GptSchema.index({ model: 1, organization: 1 }, { unique: true });

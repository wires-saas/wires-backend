import { Prop, Schema } from '@nestjs/mongoose';
import { GptAuthenticationType } from '../entities/ai.entities';

@Schema({
  timestamps: false,
  versionKey: false,
  _id: false,
})
export class GptAuthentication {
  @Prop({ type: String })
  type: GptAuthenticationType;

  @Prop({ type: String, required: false })
  apiKey?: string;
}

import { Prop, Schema } from '@nestjs/mongoose';
import { AuthenticationType } from '../entities/ai.entities';

@Schema({
  timestamps: false,
  versionKey: false,
  _id: false,
})
export class GptAuthentication {
  @Prop({ type: String })
  type: AuthenticationType;

  @Prop({ type: String, required: false })
  apiKey?: string;
}

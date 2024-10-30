import { Prop, Schema } from '@nestjs/mongoose';
import { SenderStatus } from '../entities/emails-provider.entities';

@Schema({
  timestamps: false,
  versionKey: false,
  _id: false,
  id: false,
  virtuals: false,
})
export class Sender {
  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, enum: SenderStatus, required: true })
  status: SenderStatus;
}

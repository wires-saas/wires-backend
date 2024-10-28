import { Prop, Schema } from '@nestjs/mongoose';

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
}

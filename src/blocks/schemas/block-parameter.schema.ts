import { Prop, Schema } from '@nestjs/mongoose';

@Schema({
  timestamps: false,
  versionKey: false,
  _id: false,
})
export class BlockParameter {
  @Prop({ type: String, required: true })
  key: string;

  @Prop({
    type: String,
    enum: [
      'text',
      'number',
      'boolean',
      'article',
      'content',
      'date',
      'enum',
      'array',
    ],
  })
  type: string;

  @Prop({ type: String })
  displayName: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Boolean })
  required: boolean;
}

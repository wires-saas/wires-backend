import { Prop, Schema } from '@nestjs/mongoose';
import { BlockParameterType } from '../entities/block-parameter-types';
import { BlockParameterSource } from '../entities/block-parameter-sources';

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
    enum: BlockParameterType,
  })
  type: BlockParameterType;

  @Prop({ type: String })
  displayName: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Boolean })
  required: boolean;

  @Prop({ type: String, enum: BlockParameterSource })
  source: BlockParameterSource;
}

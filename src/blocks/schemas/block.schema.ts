import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BlockParameter } from './block-parameter.schema';

export type BlockDocument = HydratedDocument<Block>;

@Schema({
  timestamps: true,
  toObject: {
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      // delete ret._id;
      return ret;
    },
  },
  toJSON: {
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      // delete ret._id;
      return ret;
    },
  },
})
export class Block {
  _id: string;

  @Prop({ type: String })
  displayName: string;

  @Prop({ type: String })
  description: string;

  @Prop({
    required: true,
    type: String,
    ref: 'Organization',
  })
  organization: string;

  @Prop({
    required: true,
    type: [BlockParameter],
    ref: 'BlockParameter',
  })
  parameters: string[];

  @Prop({ type: String })
  code: string;

  @Prop({ type: Number })
  version: number;

  constructor(partial: Partial<Block>) {
    Object.assign(this, partial);
  }
}

export const BlockSchema = SchemaFactory.createForClass(Block);

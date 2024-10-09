import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BlockParameter } from './block-parameter.schema';
import { BlockId } from './block-id.schema';

export type BlockDocument = HydratedDocument<Block>;

// Using virtuals to explode compound _id into separate fields

@Schema({
  timestamps: true,
  versionKey: false,
  id: true,
  virtuals: {
    id: {
      get() {
        return this._id.block;
      },
    },
    organization: {
      get() {
        return this._id.organization;
      },
    },
    version: {
      get() {
        return this._id.timestamp;
      },
    },
  },
  toObject: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      return ret;
    },
    virtuals: true,
  },
  toJSON: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      delete ret._id;
      return ret;
    },
    virtuals: true,
  },
})
export class Block {
  @Prop({ type: BlockId })
  _id: BlockId;

  @Prop({ type: String })
  displayName: string;

  @Prop({ type: String })
  description: string;

  @Prop({
    required: true,
    type: [BlockParameter],
    ref: 'BlockParameter',
  })
  parameters: string[];

  // TODO model

  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: Boolean, required: true })
  wysiwygEnabled: boolean;

  @Prop({ type: Boolean, required: true })
  isArchived: boolean;

  // virtuals
  id: string;
  organization: string;
  version: number;

  constructor(partial: Partial<Block>) {
    Object.assign(this, partial);
  }
}

export const BlockSchema = SchemaFactory.createForClass(Block);

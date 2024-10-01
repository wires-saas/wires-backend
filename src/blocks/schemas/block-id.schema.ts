import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';

// This schema allows for compound id fields
// toObject / transform matches the id shown to frontend

@Schema({
  timestamps: false,
  versionKey: false,
  _id: false,
  id: false,
  virtuals: false,
  toObject: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      return ret.block;
    },
  },
})
export class BlockId {
  @Prop({ type: Types.ObjectId, required: true })
  block: string;

  @Prop({
    type: String,
    ref: 'Organization',
    required: true,
  })
  organization: string;

  @Prop({ type: Number, required: true })
  timestamp: number;
}

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
      return ret.folder;
    },
  },
})
export class FolderId {
  @Prop({ type: Types.ObjectId, required: true })
  folder: string;

  @Prop({
    type: String,
    ref: 'Organization',
    required: true,
  })
  organization: string;
}

import { Prop, Schema } from '@nestjs/mongoose';

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
      return ret.resource;
    },
  },
})
export class ResourceId {
  @Prop({ type: String, required: true })
  resource: string;

  @Prop({ type: String, required: true })
  folder: string;

  @Prop({
    type: String,
    ref: 'Organization',
    required: true,
  })
  organization: string;
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum AuthenticationType {
  API_KEY = 'apiKey',
  API_KEY_SECRET = 'apiKeyWithSecret',
}

@Schema({
  timestamps: false,
  versionKey: false,
  _id: false,
  toObject: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      return ret;
    },
  },
  toJSON: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      // delete ret.type;
      if (ret.apiKey) ret.apiKey = '********';
      if (ret.secretKey) ret.secretKey = '********';
      return ret;
    },
  },
})
export class Authentication {
  @Prop({ required: true, type: String, enum: AuthenticationType })
  type: AuthenticationType;

  @Prop({ type: String, required: false })
  apiKey?: string;

  @Prop({ type: String, required: false })
  secretKey?: string;

  constructor(partial: Partial<Authentication>) {
    Object.assign(this, partial);
  }
}

export const AuthenticationSchema =
  SchemaFactory.createForClass(Authentication);

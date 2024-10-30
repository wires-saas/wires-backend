import { Prop, Schema } from '@nestjs/mongoose';
import { DomainStatus } from '../entities/emails-provider.entities';

@Schema({
  timestamps: false,
  versionKey: false,
  _id: false,
  id: false,
  virtuals: false,
})
export class Domain {
  @Prop({ type: String, required: true })
  domain: string;

  @Prop({ type: String, enum: DomainStatus, required: true })
  status: DomainStatus;

  @Prop({ type: Boolean, default: false })
  ownership: boolean;

  @Prop({ type: String, required: true })
  ownershipRecordName: string;

  @Prop({ type: String, required: true })
  ownershipRecordValue: string;

  @Prop({ type: Boolean, default: false })
  dkim: boolean;

  @Prop({ type: String, required: true })
  dkimRecordName: string;

  @Prop({ type: String, required: true })
  dkimRecordValue: string;

  @Prop({ type: Boolean, default: false })
  spf: boolean;

  @Prop({ type: String, required: true })
  spfRecordName: string;

  @Prop({ type: String, required: true })
  spfRecordValue: string;
}

import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { StripeWebhookEventType } from '../entities/webhook.entities';

export class StripeWebhookEventDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsDefined()
  created: number; // timestamp in seconds

  @IsEnum(StripeWebhookEventType)
  @IsNotEmpty()
  type: StripeWebhookEventType;

  @IsObject()
  @IsNotEmptyObject()
  data: any; // Stripe sends a nested object we store without validation

  // Unused properties

  @IsString()
  @IsNotEmpty()
  object: string;

  @IsString()
  @IsNotEmpty()
  api_version: string;

  @IsBoolean()
  @IsDefined()
  livemode: boolean;

  @IsNumber()
  @IsDefined()
  pending_webhooks: number;

  @IsObject()
  @IsNotEmptyObject()
  request: { id: string; idempotency_key: string };
}

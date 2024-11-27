import { PlanType } from '../entities/plan-type.entity';
import { PlanStatus } from '../entities/plan-status.entity';

export interface PlanDto {
  type?: PlanType;
  organization?: string;
  subscriptionId: string;
  customerId?: string;
  customerEmail?: string;
  currentPeriodStart?: number;
  currentPeriodEnd?: number;
  status?: PlanStatus;
  organizationCreationToken?: string;
  trialEnd?: number;
  lastInvoice?: string;
}

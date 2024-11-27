import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  OrganizationPlan,
  OrganizationPlanColl,
} from './schemas/organization-plan.schema';
import { PlanType } from './entities/plan-type.entity';
import { randomId } from '../shared/utils/db.utils';
import { PlanStatus } from './entities/plan-status.entity';
import { PlanDto } from './dto/plan.dto';

@Injectable()
export class OrganizationPlansService {
  private logger: Logger = new Logger(OrganizationPlansService.name);

  constructor(
    @InjectModel(OrganizationPlanColl)
    private organizationPlanModel: Model<OrganizationPlan>,
  ) {}

  private createFreePlan(organizationId: string): OrganizationPlan {
    return new OrganizationPlan({
      _id: randomId(),
      organization: organizationId,
      type: PlanType.FREE,
    });
  }

  createFreePlanForOrganization(
    organizationId: string,
  ): Promise<OrganizationPlan> {
    this.logger.log(`Creating free plan for organization ${organizationId}`);
    const plan = this.createFreePlan(organizationId);
    return new this.organizationPlanModel(plan).save();
  }

  createOrUpdate(plan: PlanDto): Promise<OrganizationPlan> {
    this.logger.log(`Upsert plan for subscription ${plan.subscriptionId}`);

    return this.organizationPlanModel
      .findOneAndUpdate(
        {
          subscriptionId: plan.subscriptionId,
        },
        plan,
        {
          upsert: true,
          new: true,
        },
      )
      .exec();
  }

  async convertFreeTrial(
    subscriptionId: string,
    start: number,
    end: number,
  ): Promise<OrganizationPlan> {
    return this.organizationPlanModel
      .findOneAndUpdate(
        {
          subscriptionId,
        },
        {
          trialEnd: Date.now(),
          currentPeriodStart: start,
          currentPeriodEnd: end,
          status: PlanStatus.ACTIVE,
        },
      )
      .exec();
  }

  async renew(
    subscriptionId: string,
    start: number,
    end: number,
  ): Promise<OrganizationPlan> {
    return this.organizationPlanModel
      .findOneAndUpdate(
        {
          subscriptionId,
        },
        {
          currentPeriodStart: start,
          currentPeriodEnd: end,
        },
      )
      .exec();
  }

  async updateCustomerEmail(
    customerId: string,
    customerEmail: string,
  ): Promise<unknown> {
    return this.organizationPlanModel
      .updateMany(
        {
          customerId,
        },
        {
          customerEmail,
        },
        {
          upsert: false,
        },
      )
      .exec();
  }

  // Set plan status to cancelled and update current period end
  async cancel(subscriptionId: string, end: number): Promise<OrganizationPlan> {
    return this.organizationPlanModel
      .findOneAndUpdate(
        {
          subscriptionId,
        },
        {
          status: PlanStatus.CANCELLED,
          currentPeriodEnd: end,
        },
      )
      .exec();
  }

  async expire(subscriptionId: string): Promise<OrganizationPlan> {
    return this.organizationPlanModel
      .findOneAndUpdate(
        {
          subscriptionId,
        },
        {
          status: PlanStatus.EXPIRED,
        },
      )
      .exec();
  }

  async updateOrganizationWithCreationToken(
    creationToken: string,
    organizationId: string,
  ): Promise<OrganizationPlan> {
    return this.organizationPlanModel
      .findOneAndUpdate(
        {
          organizationCreationToken: creationToken,
        },
        {
          organization: organizationId,
        },
      )
      .exec();
  }

  // Find last updated plan of organization
  async findOne(organizationId: string): Promise<OrganizationPlan> {
    return this.organizationPlanModel
      .findOne({
        organization: organizationId,
      })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findOneBySubscriptionId(
    subscriptionId: string,
  ): Promise<OrganizationPlan> {
    return this.organizationPlanModel
      .findOne({
        subscriptionId,
      })
      .exec();
  }

  async findOneByToken(token: string): Promise<OrganizationPlan> {
    return this.organizationPlanModel
      .findOne({
        organizationCreationToken: token,
      })
      .exec();
  }
}

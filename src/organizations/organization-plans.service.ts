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

@Injectable()
export class OrganizationPlansService {
  private logger: Logger = new Logger(OrganizationPlansService.name);

  constructor(
    @InjectModel(OrganizationPlanColl)
    private organizationPlanModel: Model<OrganizationPlan>,
  ) {}

  private createFreePlan(organizationId: string): OrganizationPlan {
    return new OrganizationPlan({
      _id: 'free',
      organization: organizationId,
      type: PlanType.FREE,
    });
  }

  private createPlan(
    type: PlanType,
    subscriptionId: string,
    customerId: string,
    currentPeriodStart: number,
    currentPeriodEnd: number,
  ): OrganizationPlan {
    return new OrganizationPlan({
      _id: randomId(),
      type,
      subscriptionId,
      customerId,
      currentPeriodStart,
      currentPeriodEnd,
      status: PlanStatus.INCOMPLETE,
    });
  }

  createForOrganization(organizationId: string): Promise<OrganizationPlan> {
    this.logger.log(`Creating free plan for organization ${organizationId}`);
    const plan = this.createFreePlan(organizationId);
    return new this.organizationPlanModel(plan).save();
  }

  create(
    type: PlanType,
    subscriptionId: string,
    customerId: string,
    currentPeriodStart: number,
    currentPeriodEnd: number,
  ): Promise<OrganizationPlan> {
    this.logger.log(
      `Creating plan ${type} for customer ${customerId} with subscription ${subscriptionId}`,
    );
    const plan = this.createPlan(
      type,
      subscriptionId,
      customerId,
      currentPeriodStart,
      currentPeriodEnd,
    );
    return new this.organizationPlanModel(plan).save();
  }

  createOrUpdate(
    type: PlanType,
    subscriptionId: string,
    customerId: string,
    currentPeriodStart: number,
    currentPeriodEnd: number,
    status: PlanStatus,
  ): Promise<OrganizationPlan> {
    this.logger.log(
      `Upsert plan ${type} for customer ${customerId} with subscription ${subscriptionId}`,
    );

    return this.organizationPlanModel
      .findOneAndUpdate(
        {
          subscriptionId,
          customerId,
        },
        {
          type,
          subscriptionId,
          customerId,
          currentPeriodStart,
          currentPeriodEnd,
          status,
        },
        {
          upsert: true,
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

  // Assigns an organization to a plan
  async updateOrganization(
    subscriptionId: string,
    organizationId: string,
  ): Promise<OrganizationPlan> {
    return this.organizationPlanModel
      .findOneAndUpdate(
        {
          subscriptionId,
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

  async remove(
    organizationId: string,
    planId: string,
  ): Promise<OrganizationPlan> {
    return this.organizationPlanModel
      .findOneAndUpdate({ _id: planId, organization: organizationId })
      .exec();
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  OrganizationPlan,
  OrganizationPlanColl,
} from './schemas/organization-plan.schema';
import { PlanType } from './entities/plan-type.entity';
import { randomId } from '../shared/utils/db.utils';

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
  ): OrganizationPlan {
    return new OrganizationPlan({
      _id: randomId(),
      type,
      subscriptionId,
      customerId,
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
  ): Promise<OrganizationPlan> {
    this.logger.log(
      `Creating plan ${type} for customer ${customerId} with subscription ${subscriptionId}`,
    );
    const plan = this.createPlan(type, subscriptionId, customerId);
    return new this.organizationPlanModel(plan).save();
  }

  async findAll(): Promise<OrganizationPlan[]> {
    return this.organizationPlanModel.find().exec();
  }

  async findOne(organizationId: string): Promise<OrganizationPlan> {
    return this.organizationPlanModel
      .findOne({
        organization: organizationId,
      })
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

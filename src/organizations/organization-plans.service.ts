import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  OrganizationPlan,
  OrganizationPlanColl,
} from './schemas/organization-plan.schema';
import { PlanType } from './entities/plan-type.entity';

@Injectable()
export class OrganizationPlansService {
  constructor(
    @InjectModel(OrganizationPlanColl)
    private organizationPlanModel: Model<OrganizationPlan>,
  ) {}

  createFreePlan(organizationId: string): OrganizationPlan {
    return new OrganizationPlan({
      _id: 'free',
      organization: organizationId,
      type: PlanType.FREE,
    });
  }

  create(organizationId: string): Promise<OrganizationPlan> {
    const plan = this.createFreePlan(organizationId);
    return new this.organizationPlanModel(plan).save();
  }

  async findAll(): Promise<OrganizationPlan[]> {
    return this.organizationPlanModel.find().exec();
  }

  async findOne(
    organizationId: string,
    planId: string,
  ): Promise<OrganizationPlan> {
    return this.organizationPlanModel
      .findById({
        _id: planId,
        organization: organizationId,
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

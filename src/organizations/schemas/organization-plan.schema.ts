import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PlanType } from '../entities/plan-type.entity';
import { Permission } from '../../rbac/permissions/schemas/permission.schema';
import { PlanTypePermissions } from '../entities/plan-type-permissions.entity';

export type OrganizationPlanDocument = HydratedDocument<OrganizationPlan>;

@Schema({
  timestamps: true,
  id: false,
  virtuals: {
    permissions: {
      get(): string[] {
        return [
          ...new Set([
            ...this.customPermissions,
            ...PlanTypePermissions[this.type],
          ]),
        ];
      },
    },
  },
  toObject: {
    //delete __v from output object
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      // delete ret._id;
      delete ret.customPermissions;
      delete ret.createdAt;
      delete ret.updatedAt;
      return ret;
    },
    virtuals: true,
  },
  toJSON: {
    //delete __v from output JSON
    versionKey: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      delete ret._id;
      delete ret.customPermissions;
      delete ret.createdAt;
      delete ret.updatedAt;
      return ret;
    },
    virtuals: true,
  },
})
export class OrganizationPlan {
  @Prop({ required: true })
  _id: string;

  @Prop({
    type: String,
    ref: 'Organization',
  })
  organization: string;

  @Prop({ required: true, enum: PlanType })
  type: PlanType;

  // Allows retrieving subscription details
  // Requesting payment provider with this external subscription ID
  @Prop()
  subscription: string;

  // Permissions are built-in to the plan
  // But can be overridden by the organization
  @Prop({ type: [String], ref: 'Permission' })
  customPermissions: Permission[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  // virtuals
  permissions: Permission[];

  constructor(partial: Partial<OrganizationPlan>) {
    Object.assign(this, partial);
  }
}

export const OrganizationPlanSchema =
  SchemaFactory.createForClass(OrganizationPlan);

export const OrganizationPlanColl = 'organization_plans';

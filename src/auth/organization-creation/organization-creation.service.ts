import {
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationPlan } from '../../organizations/schemas/organization-plan.schema';
import { OrganizationPlansService } from '../../organizations/organization-plans.service';
import { PlanType } from '../../organizations/entities/plan-type.entity';
import { UsersService } from '../../users/users.service';
import { UserWithPermissions } from '../../users/schemas/user.schema';

export interface OrganizationCreationInviteTokenCheckResult {
  plan: PlanType;
  requiresOwnerCreation: boolean;
  owner: string;
}

@Injectable()
export class OrganizationCreationService {
  private logger: Logger = new Logger(OrganizationCreationService.name);

  constructor(
    private organizationPlansService: OrganizationPlansService,
    private usersService: UsersService,
  ) {}

  // Organization creation logic

  async checkOrganizationCreationInviteToken(
    token: string,
  ): Promise<OrganizationCreationInviteTokenCheckResult> {
    const organizationPlan: OrganizationPlan =
      await this.organizationPlansService.findOneByToken(token);

    if (!organizationPlan) {
      throw new NotFoundException('Token not found');
    }

    if (organizationPlan.organization) {
      throw new GoneException('Organization already created with token');
    }

    const matchingUser: UserWithPermissions | undefined =
      await this.usersService
        .findOneByEmail(organizationPlan.customerEmail)
        .catch(() => undefined);

    return {
      plan: organizationPlan.type,
      requiresOwnerCreation: !matchingUser,
      owner: organizationPlan.customerEmail,
    };
  }
}

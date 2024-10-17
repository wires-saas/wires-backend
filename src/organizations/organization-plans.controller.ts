import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { Organization } from './schemas/organization.schema';
import { Action } from '../rbac/permissions/entities/action.entity';
import { OrganizationGuard } from '../auth/organization.guard';
import { OrganizationPlan } from './schemas/organization-plan.schema';
import { OrganizationPlansService } from './organization-plans.service';
import { ScopedSubject } from '../rbac/casl/casl.utils';
import { Subject } from '../rbac/permissions/entities/subject.entity';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId')
export class OrganizationPlansController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly organizationPlansService: OrganizationPlansService,
  ) {}

  @Get('plan')
  @ApiOperation({
    summary: 'Fetch organization plan and permissions restrictions',
  })
  @ApiOkResponse({ description: 'Organization plan and permissions' })
  @ApiUnauthorizedResponse({
    description:
      'Cannot read organization plan, requires "Read Organization" and "Read Billing" permissions',
  })
  @ApiNotFoundResponse({ description: 'Organization not found' })
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<OrganizationPlan> {
    if (
      req.ability.cannot(
        Action.Read,
        ScopedSubject(Organization, organizationId),
      ) ||
      req.ability.cannot(
        Action.Read,
        ScopedSubject(Subject.Billing, organizationId),
      )
    ) {
      throw new UnauthorizedException('Cannot read organization plan');
    }

    const org: Organization =
      await this.organizationsService.findOne(organizationId);

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return this.organizationPlansService.findOne(organizationId);
  }
}

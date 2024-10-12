import {
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

@ApiTags('Organizations')
@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId')
export class OrganizationPlansController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly organizationPlansService: OrganizationPlansService,
  ) {}

  @Get('plan')
  @ApiOperation({ summary: 'Fetch organization plan' })
  @ApiOkResponse({ description: 'Organization plan' })
  @ApiUnauthorizedResponse({
    description: 'User cannot read organization plan',
  })
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<OrganizationPlan[]> {
    if (req.ability.cannot(Action.Read, Organization)) {
      throw new UnauthorizedException();
    }

    const org = await this.organizationsService.findOne(organizationId);

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return this.organizationPlansService.findAll();
  }
}

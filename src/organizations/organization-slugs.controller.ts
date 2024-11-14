import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { Organization } from './schemas/organization.schema';

@ApiTags('Organizations (Slugs)')
@Controller('slugs/:organizationSlug')
export class OrganizationSlugsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Check if organization with slug exists',
  })
  @ApiOkResponse({ description: 'Organization with slug exists' })
  @ApiNotFoundResponse({ description: 'Organization with slug does not exist' })
  async find(
    @Param('organizationSlug') organizationSlug: string,
  ): Promise<void> {
    const org: Organization =
      await this.organizationsService.findOne(organizationSlug);

    if (!org) {
      throw new NotFoundException('Organization with slug not found');
    }
  }
}

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExcludeController,
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  OrganizationCreationInviteTokenCheckResult,
  OrganizationCreationService,
} from '../../organizations/modules/organization-creation/organization-creation.service';
import { CreateOrganizationWithTokenDto } from './create-organization-with-token.dto';
import { EmailService } from '../../services/email/email.service';

@ApiExcludeController()
@Controller('auth/organization-creation-invite')
export class OrganizationCreationController {
  constructor(
    private organizationCreationService: OrganizationCreationService,
    private emailService: EmailService,
  ) {}

  @Get(':token')
  @ApiOperation({
    summary: 'Check if organization creation invite token is valid',
  })
  @ApiOkResponse({ description: 'Invite token is valid' })
  @ApiGoneResponse({ description: 'Invite token already used' })
  @ApiNotFoundResponse({ description: 'Invite token does not exist' })
  async checkCreateOrganizationInviteToken(
    @Param('token') token: string,
  ): Promise<OrganizationCreationInviteTokenCheckResult> {
    return this.organizationCreationService.checkOrganizationCreationInviteToken(
      token,
    );
  }

  @Post(':token')
  @ApiOperation({
    summary:
      'Create organization (and owner if needed), consuming creation token',
  })
  @ApiOkResponse({ description: 'Organization created' })
  @ApiBadRequestResponse({
    description: 'Organization owner password is missing',
  })
  @ApiGoneResponse({ description: 'Creation token already used' })
  @ApiNotFoundResponse({ description: 'Creation token does not exist' })
  async useCreateOrganizationInviteToken(
    @Param('token') token: string,
    @Body() createOrganizationWithTokenDto: CreateOrganizationWithTokenDto,
  ): Promise<void> {
    const creation =
      await this.organizationCreationService.createOrganizationAndResourcesWithToken(
        token,
        createOrganizationWithTokenDto,
      );

    await this.emailService.sendOrganizationCreationConfirmationEmail(
      creation.ownerEmail,
      creation.organizationName,
    );
  }
}

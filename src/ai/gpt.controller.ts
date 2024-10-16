import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
  Logger,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { CreateGptDto } from './dto/create-gpt.dto';
import { OrganizationGuard } from '../auth/organization.guard';
import { SuperAdminGuard } from '../auth/super-admin.guard';
import { UpdateGptUsageDto } from './dto/update-gpt-usage.dto';
import { Gpt } from './schemas/gpt.schema';
import { GptService } from './gpt.service';
import { RequestGptDto } from './dto/request-gpt.dto';
import { GptRequest } from './schemas/gpt-request.schema';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { Action } from '../rbac/permissions/entities/action.entity';
import { ScopedSubject } from '../rbac/casl/casl.utils';
import { OrganizationsService } from '../organizations/organizations.service';
import { Organization } from '../organizations/schemas/organization.schema';

@ApiTags('AI')
@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId/gpt')
export class GptController {
  private readonly logger = new Logger(GptController.name);
  constructor(
    private readonly aiService: AiService,
    private readonly gptService: GptService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  // Routes reserved for super admins

  @Post()
  @UseGuards(SuperAdminGuard)
  @ApiExcludeEndpoint()
  async createGPT(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() createGptDto: CreateGptDto,
  ): Promise<Gpt> {
    if (req.ability.cannot(Action.Create, ScopedSubject(Gpt, organizationId))) {
      throw new UnauthorizedException('Cannot create GPT');
    }

    createGptDto.organization = organizationId;
    return await this.aiService.createGPT(createGptDto).catch((err) => {
      if (err.code === 11000)
        throw new ForbiddenException('GPT already exists');
      else throw err;
    });
  }

  @UseGuards(SuperAdminGuard)
  @Get('requests')
  @ApiExcludeEndpoint()
  async findAllRequests(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<GptRequest[]> {
    if (
      req.ability.cannot(Action.Read, ScopedSubject(GptRequest, organizationId))
    ) {
      throw new UnauthorizedException('Cannot read GPT requests');
    }

    return await this.gptService.findAll();
  }

  @UseGuards(SuperAdminGuard)
  @Patch(':gptId')
  @ApiExcludeEndpoint()
  updateGPT(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('gptId') gptId: string,
    @Body() updateGptUsageDto: UpdateGptUsageDto,
  ): Promise<Gpt> {
    if (req.ability.cannot(Action.Update, ScopedSubject(Gpt, organizationId))) {
      throw new UnauthorizedException('Cannot update GPT');
    }

    return this.aiService.updateGPT(gptId, updateGptUsageDto);
  }

  @UseGuards(SuperAdminGuard)
  @Delete(':gptId')
  @ApiExcludeEndpoint()
  removeGPT(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('gptId') gptId: string,
  ) {
    if (req.ability.cannot(Action.Delete, ScopedSubject(Gpt, organizationId))) {
      throw new UnauthorizedException('Cannot delete GPT');
    }

    return this.aiService.removeGPT(gptId);
  }

  // Routes for regular users

  @Get()
  findAllOfOrganization(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<Gpt[]> {
    if (req.ability.cannot(Action.Read, ScopedSubject(Gpt, organizationId))) {
      throw new UnauthorizedException();
    }
    return this.aiService.findAllGPTsOfOrganization(organizationId);
  }

  @Get(':gptId')
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('gptId') gptId: string,
  ): Promise<Gpt> {
    if (req.ability.cannot(Action.Read, ScopedSubject(Gpt, organizationId))) {
      throw new UnauthorizedException();
    }
    return this.aiService.findOne(gptId);
  }

  @Post('request')
  async requestOrganizationGPT(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() requestGptDto: RequestGptDto,
  ): Promise<string> {
    if (
      req.ability.cannot(
        Action.Create,
        ScopedSubject(GptRequest, organizationId),
      )
    ) {
      throw new UnauthorizedException('Cannot request GPT');
    }

    const organization: Organization =
      await this.organizationsService.findOne(organizationId);

    if (!organization.gpt) {
      throw new ForbiddenException('Organization does not have GPT');
    }

    const organizationGpt: Gpt = await this.aiService.findOne(organization.gpt);

    if (!organizationGpt.canRequest) {
      throw new ForbiddenException('GPT limits exceeded');
    }

    const generation = await this.gptService.request(
      organizationGpt,
      requestGptDto,
    );

    await this.aiService.updateGPT(organizationGpt._id, {
      requestsUsage: organizationGpt.usage.requestsUsage + 1,
      tokensUsage: organizationGpt.usage.tokensUsage + generation.totalTokens,
      lastRequest: Date.now(),
    });

    return generation.response;
  }

  @Post(':gptId/request')
  async requestSpecificGPT(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('gptId') gptId: string,
    @Body() requestGptDto: RequestGptDto,
  ): Promise<string> {
    if (
      req.ability.cannot(
        Action.Create,
        ScopedSubject(GptRequest, organizationId),
      )
    ) {
      throw new UnauthorizedException('Cannot request GPT');
    }

    const gpt: Gpt = await this.aiService.findOne(gptId);

    if (!gpt.canRequest) {
      throw new ForbiddenException('GPT limits exceeded');
    }

    const generation = await this.gptService.request(gpt, requestGptDto);

    await this.aiService.updateGPT(gptId, {
      requestsUsage: gpt.usage.requestsUsage + 1,
      tokensUsage: gpt.usage.tokensUsage + generation.totalTokens,
      lastRequest: Date.now(),
    });

    return generation.response;
  }
}

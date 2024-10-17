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
  HttpException,
  HttpStatus,
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
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { Action } from '../rbac/permissions/entities/action.entity';
import { ScopedSubject } from '../rbac/casl/casl.utils';
import { OrganizationsService } from '../organizations/organizations.service';
import { Organization } from '../organizations/schemas/organization.schema';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger/dist/decorators/api-response.decorator';

@ApiTags('AI')
@ApiBearerAuth()
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
  @ApiOperation({ summary: 'Get all GPTs of organization' })
  @ApiUnauthorizedResponse({
    description: 'Cannot read GPTs, requires "Read GPT" permission',
  })
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
  @ApiOperation({ summary: 'Get GPT by ID' })
  @ApiUnauthorizedResponse({
    description: 'Cannot read GPT, requires "Read GPT" permission',
  })
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
  @ApiOperation({ summary: 'Request default GPT of organization' })
  @ApiUnauthorizedResponse({
    description: 'Cannot request GPT, requires "Create GPT Request" permission',
  })
  @ApiForbiddenResponse({
    description: 'Organization does not have GPT',
  })
  @ApiTooManyRequestsResponse({
    description: 'GPT limits exceeded, requires payment or throttling',
  })
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
      throw new HttpException(
        'GPT limits exceeded',
        HttpStatus.TOO_MANY_REQUESTS,
      );
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
  @ApiOperation({ summary: 'Request specific GPT of organization' })
  @ApiUnauthorizedResponse({
    description: 'Cannot request GPT, requires "Create GPT Request" permission',
  })
  @ApiNotFoundResponse({
    description: 'GPT does not exist for organization',
  })
  @ApiTooManyRequestsResponse({
    description: 'GPT limits exceeded, requires payment or throttling',
  })
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
      throw new HttpException(
        'GPT limits exceeded',
        HttpStatus.TOO_MANY_REQUESTS,
      );
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

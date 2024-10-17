import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  NotFoundException,
  Request,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { FeedRunsService } from './feed-runs.service';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FeedsService } from '../feeds.service';
import { FeedRun } from '../schemas/feed-run.schema';
import { OrganizationGuard } from '../../auth/organization.guard';
import { AuthenticatedRequest } from '../../shared/types/authentication.types';
import { Action } from '../../rbac/permissions/entities/action.entity';
import { ScopedSubject } from '../../rbac/casl/casl.utils';

@ApiTags('Feeds (Runs)')
@ApiBearerAuth()
@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId/feeds')
export class FeedRunsController {
  private logger: Logger = new Logger(FeedRunsController.name);
  constructor(
    private readonly feedRunsService: FeedRunsService,
    private feedsService: FeedsService,
  ) {}

  @Post(':feedId/runs')
  @ApiOperation({ summary: 'Run feed' })
  @ApiUnauthorizedResponse({
    description: 'Cannot run feed, requires "Create Feed Run" permission',
  })
  @ApiNotFoundResponse({ description: 'Feed not found' })
  async runFeed(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('feedId') feedId: string,
  ): Promise<FeedRun> {
    if (
      req.ability.cannot(Action.Create, ScopedSubject(FeedRun, organizationId))
    ) {
      throw new UnauthorizedException('Cannot run feed');
    }

    this.logger.debug('User can create feed run');

    const feed = await this.feedsService.findOne(feedId);
    if (!feed) {
      throw new NotFoundException('Feed not found');
    }
    return this.feedRunsService.runFeed(feed);
  }

  @Get('runs')
  @ApiOperation({ summary: 'Get all feed runs' })
  @ApiUnauthorizedResponse({
    description: 'Cannot read feed runs, requires "Read Feed Run" permission',
  })
  async findAllOfOrganization(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<FeedRun[]> {
    if (
      req.ability.cannot(Action.Read, ScopedSubject(FeedRun, organizationId))
    ) {
      throw new UnauthorizedException('Cannot list feed runs');
    }

    const feeds = await this.feedsService.findAll(organizationId);
    return this.feedRunsService.findAllRunsOfFeeds(feeds);
  }

  @Get(':feedId/runs')
  @ApiOperation({ summary: 'Get all feed runs of specific feed' })
  @ApiUnauthorizedResponse({
    description: 'Cannot read feed runs, requires "Read Feed Run" permission',
  })
  findAllOfFeed(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('feedId') feedId: string,
  ): Promise<FeedRun[]> {
    if (
      req.ability.cannot(Action.Read, ScopedSubject(FeedRun, organizationId))
    ) {
      throw new UnauthorizedException('Cannot list feed runs');
    }
    return this.feedRunsService.findAllRunsOfFeed(feedId);
  }

  @Get(':feedId/runs/:runId')
  @ApiOperation({ summary: 'Get feed run by ID' })
  @ApiUnauthorizedResponse({
    description: 'Cannot read feed run, requires "Read Feed Run" permission',
  })
  @ApiNotFoundResponse({ description: 'Feed run not found' })
  async findOneOfFeed(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('feedId') feedId: string,
    @Param('runId') runId: string,
  ): Promise<FeedRun> {
    if (
      req.ability.cannot(Action.Read, ScopedSubject(FeedRun, organizationId))
    ) {
      throw new UnauthorizedException('Cannot list feed runs');
    }
    const run = await this.feedRunsService.findRunOfFeed(feedId, runId);

    if (!run) {
      throw new NotFoundException('Feed run not found');
    }

    return run;
  }
}

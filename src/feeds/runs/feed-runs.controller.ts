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
import { ApiTags } from '@nestjs/swagger';
import { FeedsService } from '../feeds.service';
import { FeedRun } from '../schemas/feed-run.schema';
import { OrganizationGuard } from '../../auth/organization.guard';
import { AuthenticatedRequest } from '../../shared/types/authentication.types';
import { Action } from '../../rbac/permissions/entities/action.entity';
import { ScopedSubject } from '../../rbac/casl/casl.utils';

@ApiTags('Feeds (Runs)')
@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId/feeds')
export class FeedRunsController {
  private logger: Logger = new Logger(FeedRunsController.name);
  constructor(
    private readonly feedRunsService: FeedRunsService,
    private feedsService: FeedsService,
  ) {}

  @Post(':feedId/runs')
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
    return this.feedRunsService.runFeed(feed);
  }

  @Get('runs')
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

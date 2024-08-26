import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { FeedRunsService } from './feed-runs.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { FeedsService } from '../feeds.service';
import { FeedRun } from '../schemas/feed-run.schema';

@ApiTags('Feeds (Runs)')
@UseGuards(AuthGuard)
@Controller('organizations/:organizationId/feeds')
export class FeedRunsController {
  constructor(
    private readonly feedRunsService: FeedRunsService,
    private feedsService: FeedsService,
  ) {}

  // TODO rbac / casl controls

  @Post(':feedId/runs')
  async runFeed(@Param('feedId') feedId: string): Promise<FeedRun> {
    const feed = await this.feedsService.findOne(feedId);
    return this.feedRunsService.runFeed(feed);
  }

  @Get('runs')
  async findAllOfOrganization(@Param('organizationId') organizationId: string) {
    const feeds = await this.feedsService.findAll(organizationId);
    return this.feedRunsService.findAllRunsOfFeeds(feeds);
  }

  @Get(':feedId/runs')
  findAllOfFeed(@Param('feedId') feedId: string) {
    return this.feedRunsService.findAllRunsOfFeed(feedId);
  }

  @Get(':feedId/runs/:runId')
  async findOneOfFeed(
    @Param('feedId') feedId: string,
    @Param('runId') runId: string,
  ): Promise<FeedRun> {
    const run = await this.feedRunsService.findRunOfFeed(feedId, runId);

    if (!run) {
      throw new NotFoundException('Feed run not found');
    }

    return run;
  }
}

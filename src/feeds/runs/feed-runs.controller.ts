import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { FeedRunsService } from './feed-runs.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { FeedsService } from '../feeds.service';

@ApiTags('Feeds (Runs)')
@UseGuards(AuthGuard)
@Controller('organizations/:organizationId/feeds')
export class FeedRunsController {
  constructor(
    private readonly feedRunsService: FeedRunsService,
    private feedsService: FeedsService,
  ) {}

  @Post(':feedId/runs')
  async runFeed(@Param('feedId') feedId: string) {
    const feed = await this.feedsService.findOne(feedId);
    return this.feedRunsService.runFeed(feed);
  }

  @Get('runs')
  findAllOfOrganization(@Param('organizationId') organizationId: string) {
    return this.feedRunsService.findAllRunsOfOrganization(organizationId);
  }

  @Get(':feedId/runs')
  findAllOfFeed(@Param('feedId') feedId: string) {
    return this.feedRunsService.findAllRunsOfFeed(feedId);
  }

  @Get(':feedId/runs/:runId')
  findOneOfFeed(
    @Param('feedId') feedId: string,
    @Param('runId') runId: string,
  ) {
    return this.feedRunsService.findRunOfFeed(feedId, runId);
  }
}

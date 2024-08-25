import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { FeedRunsService } from './feed-runs.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';

@ApiTags('Feeds (Runs)')
@UseGuards(AuthGuard)
@Controller('organizations/:organizationId/feeds')
export class FeedRunsController {
  constructor(private readonly feedRunsService: FeedRunsService) {}

  @Post(':feedId/runs')
  runFeed(@Param('feedId') feedId: string) {
    return this.feedRunsService.runFeed(feedId);
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

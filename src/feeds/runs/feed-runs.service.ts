import { Injectable } from '@nestjs/common';

@Injectable()
export class FeedRunsService {
  findAllRunsOfOrganization(organizationId: string) {
    return `This action returns all runs of organization #${organizationId}`;
  }

  runFeed(feedId: string) {
    return `This action adds a new run for feed #${feedId}`;
  }

  findAllRunsOfFeed(feedId: string) {
    return `This action returns all runs of feed #${feedId}`;
  }

  findRunOfFeed(feedId: string, runId: string) {
    return `This action returns run #${runId} of feed #${feedId}`;
  }
}

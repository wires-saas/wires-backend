import { Injectable, Logger } from '@nestjs/common';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { Feed } from './schemas/feed.schema';
import { Organization } from '../organizations/schemas/organization.schema';

@Injectable()
export class FeedsService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger(FeedsService.name);
  }
  create(createFeedDto: CreateFeedDto) {
    this.logger.log('Creating a new feed', createFeedDto);
    return 'This action adds a new feed';
  }

  findAll(organization: Organization): Feed[] {
    this.logger.log('Fetching all feeds for organization ' + organization._id);
    return [];
  }

  findOne(feedId: string) {
    return `This action returns a #${feedId} feed`;
  }

  update(id: number, updateFeedDto: UpdateFeedDto) {
    this.logger.log('Updating feed with id ' + id, updateFeedDto);
    return `This action updates a #${id} feed`;
  }

  remove(id: number) {
    return `This action removes a #${id} feed`;
  }
}

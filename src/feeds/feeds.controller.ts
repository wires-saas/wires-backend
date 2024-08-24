import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { Action } from '../rbac/permissions/entities/action.entity';
import { Feed } from './schemas/feed.schema';
import { OrganizationsService } from '../organizations/organizations.service';

@ApiTags('Feeds')
@UseGuards(AuthGuard)
@Controller('organizations/:organizationId/feeds')
export class FeedsController {
  private logger: Logger;
  constructor(
    private readonly feedsService: FeedsService,
    private organizationsService: OrganizationsService,
  ) {
    this.logger = new Logger(FeedsController.name);
  }

  @Post()
  create(@Body() createFeedDto: CreateFeedDto) {
    return this.feedsService.create(createFeedDto);
  }

  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<Feed[]> {
    if (req.ability.cannot(Action.Read, Feed)) {
      throw new UnauthorizedException('Cannot read feeds');
    }

    const organization = await this.organizationsService.findOneWithAbility(
      organizationId,
      req.ability,
    );

    return this.feedsService.findAll(organization);
  }

  @Get(':feedId')
  findOne(@Param('feedId') feedId: string) {
    return this.feedsService.findOne(feedId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFeedDto: UpdateFeedDto) {
    return this.feedsService.update(+id, updateFeedDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedsService.remove(+id);
  }
}

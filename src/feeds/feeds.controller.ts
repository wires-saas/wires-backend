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
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { Action } from '../rbac/permissions/entities/action.entity';
import { Feed } from './schemas/feed.schema';
import { OrganizationGuard } from '../auth/organization.guard';

@ApiTags('Feeds')
@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId/feeds')
export class FeedsController {
  private logger: Logger = new Logger(FeedsController.name);
  constructor(private readonly feedsService: FeedsService) {}

  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() createFeedDto: CreateFeedDto,
  ): Promise<Feed> {
    if (req.ability.cannot(Action.Create, Feed)) {
      // user could  create feed for other organizations ?
      throw new UnauthorizedException('Cannot create feeds');
    }

    return this.feedsService.create(organizationId, createFeedDto);
  }

  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<Feed[]> {
    if (req.ability.cannot(Action.Read, Feed)) {
      throw new UnauthorizedException('Cannot read feeds');
    }

    return this.feedsService.findAll(organizationId);
  }

  @Get(':feedId')
  async findOne(
    @Request() req: AuthenticatedRequest,
    @Param('feedId') feedId: string,
  ): Promise<Feed> {
    if (req.ability.cannot(Action.Read, Feed)) {
      throw new UnauthorizedException('Cannot read feeds');
    }

    return this.feedsService.findOneWithAbility(feedId, req.ability);
  }

  @Patch(':feedId')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('feedId') feedId: string,
    @Body() updateFeedDto: UpdateFeedDto,
  ): Promise<Feed> {
    if (req.ability.cannot(Action.Update, Feed)) {
      throw new UnauthorizedException('Cannot update feeds');
    }

    // Ensures feed exists and user has access to it
    const feed = await this.feedsService.findOneWithAbility(
      feedId,
      req.ability,
    );

    if (req.ability.cannot(Action.Update, feed)) {
      throw new UnauthorizedException('Cannot update this feed');
    }

    return this.feedsService.update(feedId, updateFeedDto);
  }

  @Delete(':feedId')
  async remove(
    @Request() req: AuthenticatedRequest,
    @Param('feedId') feedId: string,
  ): Promise<Feed> {
    if (req.ability.cannot(Action.Delete, Feed)) {
      throw new UnauthorizedException('Cannot delete feeds');
    }

    return this.feedsService.remove(feedId);
  }
}

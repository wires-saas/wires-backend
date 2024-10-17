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
  NotFoundException,
} from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { Action } from '../rbac/permissions/entities/action.entity';
import { Feed } from './schemas/feed.schema';
import { OrganizationGuard } from '../auth/organization.guard';
import { ScopedSubject } from '../rbac/casl/casl.utils';

@ApiTags('Feeds')
@ApiBearerAuth()
@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId/feeds')
export class FeedsController {
  private logger: Logger = new Logger(FeedsController.name);
  constructor(private readonly feedsService: FeedsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new feed' })
  @ApiUnauthorizedResponse({
    description: 'Cannot create feed, requires "Create Feed" permission',
  })
  async create(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() createFeedDto: CreateFeedDto,
  ): Promise<Feed> {
    if (
      req.ability.cannot(Action.Create, ScopedSubject(Feed, organizationId))
    ) {
      // user could  create feed for other organizations ?
      throw new UnauthorizedException('Cannot create feeds');
    }

    return this.feedsService.create(organizationId, createFeedDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all feeds' })
  @ApiUnauthorizedResponse({
    description: 'Cannot read feeds, requires "Read Feed" permission',
  })
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<Feed[]> {
    if (req.ability.cannot(Action.Read, ScopedSubject(Feed, organizationId))) {
      throw new UnauthorizedException('Cannot read feeds');
    }

    return this.feedsService.findAll(organizationId);
  }

  @Get(':feedId')
  @ApiOperation({ summary: 'Get feed by ID' })
  @ApiUnauthorizedResponse({
    description: 'Cannot read feed, requires "Read Feed" permission',
  })
  @ApiNotFoundResponse({ description: 'Feed not found' })
  async findOne(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('feedId') feedId: string,
  ): Promise<Feed> {
    if (req.ability.cannot(Action.Read, ScopedSubject(Feed, organizationId))) {
      throw new UnauthorizedException('Cannot read feed');
    }

    return this.feedsService.findOneWithAbility(feedId, req.ability);
  }

  @Patch(':feedId')
  @ApiOperation({ summary: 'Update feed by ID' })
  @ApiUnauthorizedResponse({
    description: 'Cannot update feed, requires "Update Feed" permission',
  })
  @ApiNotFoundResponse({ description: 'Feed not found' })
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('feedId') feedId: string,
    @Body() updateFeedDto: UpdateFeedDto,
  ): Promise<Feed> {
    if (
      req.ability.cannot(Action.Update, ScopedSubject(Feed, organizationId))
    ) {
      throw new UnauthorizedException('Cannot update feeds');
    }

    // Ensures feed exists and user has access to it
    const feed = await this.feedsService.findOneWithAbility(
      feedId,
      req.ability,
    );

    if (!feed) {
      throw new NotFoundException('Feed not found');
    }

    return this.feedsService.update(feedId, updateFeedDto);
  }

  @Delete(':feedId')
  @ApiOperation({ summary: 'Delete feed by ID' })
  @ApiUnauthorizedResponse({
    description: 'Cannot delete feed, requires "Delete Feed" permission',
  })
  async remove(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('feedId') feedId: string,
  ): Promise<Feed> {
    if (
      req.ability.cannot(Action.Delete, ScopedSubject(Feed, organizationId))
    ) {
      throw new UnauthorizedException('Cannot delete feeds');
    }

    return this.feedsService.remove(feedId);
  }
}

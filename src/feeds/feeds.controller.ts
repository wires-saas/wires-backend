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
  async create(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() createFeedDto: CreateFeedDto,
  ) {
    if (req.ability.cannot(Action.Create, Feed)) {
      throw new UnauthorizedException('Cannot create feeds');
    }

    // Ensures organization exists and user has access to it
    await this.organizationsService.findOneWithAbility(
      organizationId,
      req.ability,
    );

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

    // Ensures organization exists and user has access to it
    await this.organizationsService.findOneWithAbility(
      organizationId,
      req.ability,
    );

    return this.feedsService.findAll(organizationId);
  }

  @Get(':feedId')
  async findOne(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('feedId') feedId: string,
  ): Promise<Feed> {
    if (req.ability.cannot(Action.Read, Feed)) {
      throw new UnauthorizedException('Cannot read feeds');
    }

    // Ensures organization exists and user has access to it
    await this.organizationsService.findOneWithAbility(
      organizationId,
      req.ability,
    );

    return this.feedsService.findOneByAbility(feedId, req.ability);
  }

  @Patch(':feedId')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('feedId') feedId: string,
    @Body() updateFeedDto: UpdateFeedDto,
  ) {
    if (req.ability.cannot(Action.Update, Feed)) {
      throw new UnauthorizedException('Cannot update feeds');
    }

    // Ensures organization exists and user has access to it
    await this.organizationsService.findOneWithAbility(
      organizationId,
      req.ability,
    );

    return this.feedsService.update(feedId, updateFeedDto);
  }

  @Delete(':feedId')
  async remove(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('feedId') feedId: string,
  ): Promise<Feed> {
    if (req.ability.cannot(Action.Delete, Feed)) {
      throw new UnauthorizedException('Cannot delete feeds');
    }

    // Ensures organization exists and user has access to it
    await this.organizationsService.findOneWithAbility(
      organizationId,
      req.ability,
    );

    return this.feedsService.remove(feedId);
  }
}

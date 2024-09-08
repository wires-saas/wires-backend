import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  Logger,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateOrUpdateTagDto } from './dto/create-tag.dto';
import { OrganizationGuard } from '../auth/organization.guard';
import { Tag } from './schemas/tag.schema';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { Action } from '../rbac/permissions/entities/action.entity';
import { ScopedSubject } from '../rbac/casl/casl.utils';

@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId/tags')
export class TagsController {
  private logger: Logger;
  constructor(private readonly tagsService: TagsService) {
    this.logger = new Logger(TagsController.name);
  }

  @Put()
  async create(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() tagDto: CreateOrUpdateTagDto,
  ): Promise<Tag> {
    if (req.ability.cannot(Action.Create, ScopedSubject(Tag, organizationId))) {
      throw new UnauthorizedException('Cannot create tags');
    }

    const tagToCreate = new Tag({ ...tagDto, organization: organizationId });

    const tag = await this.tagsService.createOrUpdate(tagToCreate);

    const articlesWithTag = await this.tagsService.applyTagRules(tag);
    this.logger.log(
      `Tag ${tag._id} applied to ${articlesWithTag.length} articles`,
    );

    return tag;
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<Tag[]> {
    if (req.ability.cannot(Action.Read, ScopedSubject(Tag, organizationId))) {
      throw new UnauthorizedException('Cannot read tags');
    }

    return this.tagsService.findAllOfOrganization(organizationId);
  }

  @Delete(':tagId')
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('tagId') tagId: string,
  ): Promise<Tag> {
    if (req.ability.cannot(Action.Delete, ScopedSubject(Tag, organizationId))) {
      throw new UnauthorizedException('Cannot delete tags');
    }

    return this.tagsService.remove(tagId);
  }
}

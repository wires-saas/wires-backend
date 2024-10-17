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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Article } from '../articles/schemas/article.schema';

@ApiTags('Tags')
@ApiBearerAuth()
@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId/tags')
export class TagsController {
  private logger: Logger = new Logger(TagsController.name);
  constructor(private readonly tagsService: TagsService) {}

  @Put()
  @ApiOperation({ summary: 'Create new tag' })
  @ApiOkResponse({ description: 'Tag created' })
  @ApiUnauthorizedResponse({
    description: 'Cannot create tag, requires "Create Tag" permission',
  })
  async create(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() tagDto: CreateOrUpdateTagDto,
  ): Promise<Tag> {
    if (req.ability.cannot(Action.Create, ScopedSubject(Tag, organizationId))) {
      throw new UnauthorizedException('Cannot create tags');
    }

    const tagToCreate = new Tag({ ...tagDto, organization: organizationId });

    const tag: Tag = await this.tagsService.createOrUpdate(tagToCreate);

    const articlesWithTag: Article[] =
      await this.tagsService.applyTagRules(tag);
    this.logger.log(
      `Tag ${tag._id} applied to ${articlesWithTag.length} articles`,
    );

    return tag;
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all tags' })
  @ApiOkResponse({ description: 'All tags' })
  @ApiUnauthorizedResponse({
    description: 'Cannot read tags, requires "Read Tag" permission',
  })
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
  @ApiOperation({ summary: 'Delete tag' })
  @ApiOkResponse({ description: 'Tag deleted' })
  @ApiUnauthorizedResponse({
    description: 'Cannot delete tag, requires "Delete Tag" permission',
  })
  async remove(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('tagId') tagId: string,
  ): Promise<Tag> {
    if (req.ability.cannot(Action.Delete, ScopedSubject(Tag, organizationId))) {
      throw new UnauthorizedException('Cannot delete tags');
    }

    const tag = await this.tagsService.findOne(organizationId, tagId);

    return this.tagsService.remove(tag);
  }
}

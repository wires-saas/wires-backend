import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { OrganizationsService } from '../organizations/organizations.service';
import { Action } from '../rbac/permissions/entities/action.entity';
import { Article } from './schemas/article.schema';
import { OrganizationGuard } from '../auth/organization.guard';

@ApiTags('Articles')
@ApiBearerAuth()
@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId/articles')
export class ArticlesController {
  private logger: Logger = new Logger(ArticlesController.name);
  constructor(
    private readonly articlesService: ArticlesService,
    private organizationsService: OrganizationsService,
  ) {}

  @Post()
  @ApiUnauthorizedResponse({
    description: 'Cannot create article, requires "Create Article" permission',
  })
  create(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    if (req.ability.cannot(Action.Create, Article)) {
      throw new UnauthorizedException('Cannot create article');
    }

    return this.articlesService.create(createArticleDto);
  }

  @Get()
  @ApiUnauthorizedResponse({
    description: 'Cannot read articles, requires "Read Article" permission',
  })
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<Article[]> {
    if (req.ability.cannot(Action.Read, Article)) {
      throw new UnauthorizedException('Cannot read articles');
    }

    await this.organizationsService.findOneWithAbility(
      organizationId,
      req.ability,
    );

    return this.articlesService.findAllOfOrganization(organizationId);
  }

  @Get(':id')
  @ApiUnauthorizedResponse({
    description: 'Cannot read article, requires "Read Article" permission',
  })
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('articleId') articleId: string,
  ) {
    if (req.ability.cannot(Action.Read, Article)) {
      throw new UnauthorizedException('Cannot read article');
    }

    return this.articlesService.findOne(articleId);
  }

  @Delete(':id')
  @ApiUnauthorizedResponse({
    description: 'Cannot delete article, requires "Delete Article" permission',
  })
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('articleId') articleId: string,
  ) {
    if (req.ability.cannot(Action.Delete, Article)) {
      throw new UnauthorizedException('Cannot delete article');
    }

    return this.articlesService.remove(articleId);
  }
}

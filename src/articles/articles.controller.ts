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
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { OrganizationsService } from '../organizations/organizations.service';
import { Action } from '../rbac/permissions/entities/action.entity';
import { Article } from './schemas/article.schema';

@ApiTags('Articles')
@UseGuards(AuthGuard)
@Controller('organizations/:organizationId/articles')
export class ArticlesController {
  private logger: Logger;
  constructor(
    private readonly articlesService: ArticlesService,
    private organizationsService: OrganizationsService,
  ) {
    this.logger = new Logger(ArticlesController.name);
  }

  @Post()
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
  }

  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ) {
    if (req.ability.cannot(Action.Read, Article)) {
      return [];
    }

    await this.organizationsService.findOneWithAbility(
      organizationId,
      req.ability,
    );

    return this.articlesService.findAllOfOrganization(organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articlesService.remove(+id);
  }
}

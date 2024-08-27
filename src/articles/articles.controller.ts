import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { FeedsService } from '../feeds/feeds.service';

@ApiTags('Articles')
@UseGuards(AuthGuard)
@Controller('organizations/:organizationId/articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private feedsService: FeedsService,
  ) {}

  @Post()
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
  }

  @Get()
  async findAll(@Param('organizationId') organizationId: string) {
    const feeds = await this.feedsService.findAll(organizationId);
    console.log('got feeds', feeds);
    return this.articlesService.findAll(feeds);
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

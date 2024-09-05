import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  Logger,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateOrUpdateTagDto } from './dto/create-tag.dto';
import { OrganizationGuard } from '../auth/organization.guard';
import { Tag } from './schemas/tag.schema';
import * as util from 'util';

@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId/tags')
export class TagsController {
  private logger: Logger;
  constructor(private readonly tagsService: TagsService) {
    this.logger = new Logger(TagsController.name);
  }

  @Put()
  async create(
    @Param('organizationId') organizationId: string,
    @Body() tagDto: CreateOrUpdateTagDto,
  ): Promise<Tag> {
    console.log(util.inspect(tagDto, true, 10));

    const tagToCreate = new Tag({ ...tagDto, organization: organizationId });
    this.logger.log(tagToCreate);

    const tag = await this.tagsService.createOrUpdate(tagToCreate);

    const articlesWithTag = await this.tagsService.applyTagRules(tag);
    this.logger.log(
      `Tag ${tag._id} applied to ${articlesWithTag.length} articles`,
    );

    return tag;
  }

  @Get()
  findAll(): Promise<Tag[]> {
    return this.tagsService.findAll();
  }

  @Get(':tagId')
  findOne(@Param('tagId') tagId: string): Promise<Tag> {
    return this.tagsService.findOne(tagId);
  }

  @Delete(':tagId')
  remove(@Param('tagId') tagId: string): Promise<Tag> {
    return this.tagsService.remove(tagId);
  }
}

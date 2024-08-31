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
import { TagFilter } from './schemas/tag-filter.schema';
import * as util from 'util';

@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId/tags')
export class TagsController {
  private logger: Logger;
  constructor(private readonly tagsService: TagsService) {
    this.logger = new Logger(TagsController.name);
  }

  @Put()
  create(
    @Param('organizationId') organizationId: string,
    @Body() tagDto: CreateOrUpdateTagDto,
  ): Promise<Tag> {
    // Parsing record to map
    /*
    const tagDefinition:  = {};
    Object.keys(tagDto.definition).forEach((key) => {
      const filters: TagFilter[] = tagDto.definition[key].filters.map(
        (filter) => new TagFilter({ ...filter }),
      );

      const rule: TagDefinitionRule = new TagDefinitionRule({
        operator: tagDto.definition[key].operator,
        filters,
      });

      tagDefinition[key] = rule;
    });

    const dto: Omit<CreateOrUpdateTagDto, 'definition'> & {
      definition: Record<string, TagDefinitionRule>;
    } = {
      ...tagDto,
      definition: tagDefinition,
    };

     */

    console.log(util.inspect(tagDto, true, 10));

    const tag = new Tag({ ...tagDto, organization: organizationId });
    this.logger.log(tag);

    return this.tagsService.createOrUpdate(tag);
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

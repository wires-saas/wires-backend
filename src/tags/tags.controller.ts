import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateOrUpdateTagDto } from './dto/create-tag.dto';
import { OrganizationGuard } from '../auth/organization.guard';
import { Tag } from './schemas/tag.schema';

@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Put()
  create(
    @Param('organizationId') organizationId: string,
    @Body() tagDto: CreateOrUpdateTagDto,
  ): Promise<Tag> {
    const tag = new Tag({ ...tagDto, organization: organizationId });

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

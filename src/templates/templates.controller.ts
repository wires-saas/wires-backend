import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Put,
  NotFoundException,
  Patch,
  UnauthorizedException,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { OrganizationGuard } from '../auth/organization.guard';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { Block } from './schemas/template.schema';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { ArchiveTemplateDto } from './dto/archive-template.dto';
import { Action } from '../rbac/permissions/entities/action.entity';
import { ScopedSubject } from '../rbac/casl/casl.utils';

@ApiTags('Blocks')
@ApiBearerAuth()
@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId/blocks')
export class TemplatesController {
  constructor(private readonly blocksService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new block' })
  @ApiUnauthorizedResponse({
    description: 'Cannot create block, requires "Create Block" permission',
  })
  create(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() createBlockDto: CreateTemplateDto,
  ): Promise<Block> {
    if (
      req.ability.cannot(Action.Create, ScopedSubject(Block, organizationId))
    ) {
      throw new UnauthorizedException('Cannot create block');
    }

    return this.blocksService.create(organizationId, createBlockDto);
  }

  @Put(':blockId')
  @ApiOperation({ summary: 'Update existing block' })
  @ApiUnauthorizedResponse({
    description: 'Cannot update block, requires "Update Block" permission',
  })
  @ApiNotFoundResponse({ description: 'Block not found' })
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('blockId') blockId: string,
    @Body() updateBlockDto: UpdateTemplateDto,
  ): Promise<Block> {
    if (
      req.ability.cannot(Action.Update, ScopedSubject(Block, organizationId))
    ) {
      throw new UnauthorizedException('Cannot update block');
    }

    const block = await this.blocksService.findOne(organizationId, blockId);
    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return this.blocksService.update(blockId, organizationId, updateBlockDto);
  }

  @Patch(':blockId')
  @ApiOperation({ summary: 'Archive block' })
  @ApiUnauthorizedResponse({
    description: 'Cannot archive block, requires "Update Block" permission',
  })
  @ApiNotFoundResponse({ description: 'Block not found' })
  async archive(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('blockId') blockId: string,
    @Body() archiveBlockDto: ArchiveTemplateDto,
  ): Promise<Block> {
    if (
      req.ability.cannot(Action.Update, ScopedSubject(Block, organizationId))
    ) {
      throw new UnauthorizedException('Cannot update block');
    }

    const block = await this.blocksService.findOne(organizationId, blockId);
    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return this.blocksService.updateIsArchived(
      blockId,
      organizationId,
      block,
      archiveBlockDto.isArchived,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all blocks' })
  @ApiUnauthorizedResponse({
    description: 'Cannot read blocks, requires "Read Block" permission',
  })
  findAll(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<Block[]> {
    if (req.ability.cannot(Action.Read, ScopedSubject(Block, organizationId))) {
      throw new UnauthorizedException('Cannot read blocks');
    }

    return this.blocksService.findAllOfOrganization(organizationId);
  }

  @Get(':blockId')
  @ApiOperation({ summary: 'Get block by ID' })
  @ApiUnauthorizedResponse({
    description: 'Cannot read block, requires "Read Block" permission',
  })
  @ApiNotFoundResponse({ description: 'Block not found' })
  async findOne(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('blockId') blockId: string,
  ): Promise<Block> {
    if (req.ability.cannot(Action.Read, ScopedSubject(Block, organizationId))) {
      throw new UnauthorizedException('Cannot read block');
    }

    const block = await this.blocksService.findOne(organizationId, blockId);
    if (!block) {
      throw new NotFoundException('Block not found');
    }

    return block;
  }

  @Delete(':blockId')
  @ApiOperation({ summary: 'Delete block by ID' })
  @ApiUnauthorizedResponse({
    description: 'Cannot delete block, requires "Delete Block" permission',
  })
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('blockId') blockId: string,
  ) {
    if (
      req.ability.cannot(Action.Delete, ScopedSubject(Block, organizationId))
    ) {
      throw new UnauthorizedException('Cannot delete block');
    }

    return this.blocksService.remove(organizationId, blockId);
  }
}

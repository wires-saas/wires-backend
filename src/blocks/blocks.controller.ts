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
import { BlocksService } from './blocks.service';
import { ApiTags } from '@nestjs/swagger';
import { OrganizationGuard } from '../auth/organization.guard';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { Block } from './schemas/block.schema';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { ArchiveBlockDto } from './dto/archive-block.dto';
import { Action } from '../rbac/permissions/entities/action.entity';
import { ScopedSubject } from '../rbac/casl/casl.utils';

@ApiTags('Blocks')
@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId/blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() createBlockDto: CreateBlockDto,
  ): Promise<Block> {
    if (
      req.ability.cannot(Action.Create, ScopedSubject(Block, organizationId))
    ) {
      throw new UnauthorizedException('Cannot create block');
    }

    return this.blocksService.create(organizationId, createBlockDto);
  }

  @Put(':blockId')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('blockId') blockId: string,
    @Body() updateBlockDto: UpdateBlockDto,
  ): Promise<Block> {
    if (
      req.ability.cannot(Action.Update, ScopedSubject(Block, organizationId))
    ) {
      throw new UnauthorizedException('Cannot update block');
    }

    return this.blocksService.update(blockId, organizationId, updateBlockDto);
  }

  @Patch(':blockId')
  async archive(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('blockId') blockId: string,
    @Body() archiveBlockDto: ArchiveBlockDto,
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

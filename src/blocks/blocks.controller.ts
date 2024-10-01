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
} from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { ApiTags } from '@nestjs/swagger';
import { OrganizationGuard } from '../auth/organization.guard';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { Block } from './schemas/block.schema';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

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
    return this.blocksService.create(organizationId, createBlockDto);
  }

  @Put(':blockId')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('blockId') blockId: string,
    @Body() updateBlockDto: UpdateBlockDto,
  ): Promise<Block> {
    return this.blocksService.update(blockId, organizationId, updateBlockDto);
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<Block[]> {
    return this.blocksService.findAllOfOrganization(organizationId);
  }

  @Get(':blockId')
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('blockId') blockId: string,
  ): Promise<Block> {
    return this.blocksService.findOne(organizationId, blockId);
  }

  @Delete(':blockId')
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('blockId') blockId: string,
  ) {
    return this.blocksService.remove(organizationId, blockId);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { ApiTags } from '@nestjs/swagger';
import { OrganizationGuard } from '../auth/organization.guard';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { Block } from './schemas/block.schema';
import { CreateOrUpdateBlockDto } from './dto/create-or-update-block.dto';

@ApiTags('Blocks')
@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId/blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() createOrUpdateBlockDto: CreateOrUpdateBlockDto,
  ): Promise<Block> {
    return this.blocksService.createOrUpdate(
      organizationId,
      createOrUpdateBlockDto,
    );
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

  @Delete(':id')
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('blockId') blockId: string,
  ) {
    return this.blocksService.remove(organizationId, blockId);
  }
}

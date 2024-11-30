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
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { ArchiveTemplateDto } from './dto/archive-template.dto';
import { Action } from '../rbac/permissions/entities/action.entity';
import { ScopedSubject } from '../rbac/casl/casl.utils';
import { Template } from './schemas/template.schema';

@ApiTags('Blocks')
@ApiBearerAuth()
@UseGuards(OrganizationGuard)
@Controller('organizations/:organizationId/templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new template' })
  @ApiUnauthorizedResponse({
    description:
      'Cannot create template, requires "Create Template" permission',
  })
  create(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() createTemplateDto: CreateTemplateDto,
  ): Promise<Template> {
    if (
      req.ability.cannot(Action.Create, ScopedSubject(Template, organizationId))
    ) {
      throw new UnauthorizedException('Cannot create template');
    }

    return this.templatesService.create(organizationId, createTemplateDto);
  }

  @Put(':templateId')
  @ApiOperation({ summary: 'Update existing template' })
  @ApiUnauthorizedResponse({
    description:
      'Cannot update template, requires "Update Template" permission',
  })
  @ApiNotFoundResponse({ description: 'Template not found' })
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('templateId') templateId: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ): Promise<Template> {
    if (
      req.ability.cannot(Action.Update, ScopedSubject(Template, organizationId))
    ) {
      throw new UnauthorizedException('Cannot update template');
    }

    const template = await this.templatesService.findOne(
      organizationId,
      templateId,
    );
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return this.templatesService.update(
      templateId,
      organizationId,
      updateTemplateDto,
    );
  }

  @Patch(':templateId')
  @ApiOperation({ summary: 'Archive template' })
  @ApiUnauthorizedResponse({
    description:
      'Cannot archive template, requires "Update Template" permission',
  })
  @ApiNotFoundResponse({ description: 'Template not found' })
  async archive(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('templateId') templateId: string,
    @Body() archiveTemplateDto: ArchiveTemplateDto,
  ): Promise<Template> {
    if (
      req.ability.cannot(Action.Update, ScopedSubject(Template, organizationId))
    ) {
      throw new UnauthorizedException('Cannot update template');
    }

    const template = await this.templatesService.findOne(
      organizationId,
      templateId,
    );
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return this.templatesService.updateIsArchived(
      templateId,
      organizationId,
      template,
      archiveTemplateDto.isArchived,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates' })
  @ApiUnauthorizedResponse({
    description: 'Cannot read templates, requires "Read Template" permission',
  })
  findAll(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<Template[]> {
    if (
      req.ability.cannot(Action.Read, ScopedSubject(Template, organizationId))
    ) {
      throw new UnauthorizedException('Cannot read templates');
    }

    return this.templatesService.findAllOfOrganization(organizationId);
  }

  @Get(':templateId')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiUnauthorizedResponse({
    description: 'Cannot read template, requires "Read Template" permission',
  })
  @ApiNotFoundResponse({ description: 'Template not found' })
  async findOne(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('templateId') templateId: string,
  ): Promise<Template> {
    if (
      req.ability.cannot(Action.Read, ScopedSubject(Template, organizationId))
    ) {
      throw new UnauthorizedException('Cannot read template');
    }

    const template = await this.templatesService.findOne(
      organizationId,
      templateId,
    );
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  @Delete(':templateId')
  @ApiOperation({ summary: 'Delete template by ID' })
  @ApiUnauthorizedResponse({
    description:
      'Cannot delete template, requires "Delete Template" permission',
  })
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('templateId') templateId: string,
  ) {
    if (
      req.ability.cannot(Action.Delete, ScopedSubject(Template, organizationId))
    ) {
      throw new UnauthorizedException('Cannot delete template');
    }

    return this.templatesService.remove(organizationId, templateId);
  }
}

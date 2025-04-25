import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomId } from '../shared/utils/db.utils';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { I18nService } from 'nestjs-i18n';
import { Template } from './schemas/template.schema';

@Injectable()
export class TemplatesService {
  private logger: Logger = new Logger(TemplatesService.name);

  constructor(
    @InjectModel(Template.name) private templateModel: Model<Template>,
    private readonly i18n: I18nService,
  ) {}

  create(
    organizationId: string,
    createBlockDto: CreateTemplateDto,
  ): Promise<Template> {
    this.logger.log('Creating new template');

    return new this.templateModel(
      new Template({
        _id: {
          template: randomId(),
          organization: organizationId,
          timestamp: Date.now(),
        },
        displayName: createBlockDto.displayName,
        description: createBlockDto.description,
        icon: createBlockDto.icon,
        blocks: createBlockDto.blocks,
        isArchived: false,
      }),
    ).save();
  }

  update(
    blockId: string,
    organizationId: string,
    updateTemplateDto: UpdateTemplateDto,
  ): Promise<Template> {
    this.logger.log('Updating existing template');

    return new this.templateModel(
      new Template({
        _id: {
          template: blockId,
          organization: organizationId,
          timestamp: Date.now(),
        },
        displayName: updateTemplateDto.displayName,
        description: updateTemplateDto.description,
        icon: updateTemplateDto.icon,
        blocks: updateTemplateDto.blocks,
        isArchived: updateTemplateDto.isArchived,
      }),
    ).save();
  }

  async updateIsArchived(
    templateId: string,
    organizationId: string,
    template: Template,
    isArchived: boolean,
  ): Promise<Template> {
    this.logger.log('Updating template isArchived');

    return new this.templateModel(
      new Template({
        _id: {
          template: templateId,
          organization: organizationId,
          timestamp: Date.now(),
        },
        displayName: template.displayName,
        description: template.description,
        icon: template.icon,
        blocks: template.blocks,
        isArchived: isArchived,
      }),
    ).save();
  }

  async findAllOfOrganization(organizationId: string): Promise<Template[]> {
    return this.templateModel
      .aggregate([
        { $match: { '_id.organization': organizationId } },
        { $sort: { '_id.timestamp': -1 } },
        { $group: { _id: '$_id.template', doc: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$doc' } },
        { $sort: { '_id.timestamp': -1 } },
      ])
      .then((templates) =>
        templates.map((template) => new this.templateModel(template)),
      );
  }

  findOne(organizationId: string, templateId: string): Promise<Template> {
    return this.templateModel.findOne(
      {
        '_id.template': templateId,
        '_id.organization': organizationId,
      },
      {},
      {
        sort: { '_id.timestamp': -1 },
      },
    );
  }

  remove(organizationId: string, templateId: string) {
    this.logger.log('Deleting template');
    return this.templateModel.deleteMany({
      '_id.template': templateId,
      '_id.organization': organizationId,
    });
  }
}

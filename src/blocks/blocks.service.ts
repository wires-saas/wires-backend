import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Block } from './schemas/block.schema';
import { randomId } from '../shared/utils/db.utils';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { ExampleBlockIds } from './entities/example-blocks';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class BlocksService {
  private logger: Logger = new Logger(BlocksService.name);

  constructor(
    @InjectModel(Block.name) private blockModel: Model<Block>,
    private readonly i18n: I18nService,
  ) {}

  create(
    organizationId: string,
    createBlockDto: CreateBlockDto,
  ): Promise<Block> {
    this.logger.log('Creating new block');

    return new this.blockModel(
      new Block({
        _id: {
          block: randomId(),
          organization: organizationId,
          timestamp: Date.now(),
        },
        displayName: createBlockDto.displayName,
        description: createBlockDto.description,
        code: createBlockDto.code,
        wysiwygEnabled: createBlockDto.wysiwygEnabled,
        isArchived: false,
      }),
    ).save();
  }

  update(
    blockId: string,
    organizationId: string,
    updateBlockDto: UpdateBlockDto,
  ): Promise<Block> {
    this.logger.log('Updating existing block');

    return new this.blockModel(
      new Block({
        _id: {
          block: blockId,
          organization: organizationId,
          timestamp: Date.now(),
        },
        displayName: updateBlockDto.displayName,
        description: updateBlockDto.description,
        code: updateBlockDto.code,
        wysiwygEnabled: updateBlockDto.wysiwygEnabled,
        isArchived: updateBlockDto.isArchived,
      }),
    ).save();
  }

  async updateIsArchived(
    blockId: string,
    organizationId: string,
    block: Block,
    isArchived: boolean,
  ): Promise<Block> {
    this.logger.log('Updating block isArchived');

    return new this.blockModel(
      new Block({
        _id: {
          block: blockId,
          organization: organizationId,
          timestamp: Date.now(),
        },
        displayName: block.displayName,
        description: block.description,
        code: block.code,
        wysiwygEnabled: block.wysiwygEnabled,
        isArchived: isArchived,
      }),
    ).save();
  }

  async findAllOfOrganization(organizationId: string): Promise<Block[]> {
    return this.blockModel
      .aggregate([
        { $match: { '_id.organization': organizationId } },
        { $sort: { '_id.timestamp': -1 } },
        { $group: { _id: '$_id.block', doc: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$doc' } },
        { $sort: { '_id.timestamp': -1 } },
      ])
      .then((blocks) => blocks.map((block) => new this.blockModel(block)));
  }

  async findAllOfOrganizationPaginated(
    organizationId: string,
    page: number,
    limit: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    searchFilter?: string,
  ): Promise<Block[]> {
    return this.blockModel
      .aggregate([
        { $match: { '_id.organization': organizationId } },
        { $sort: { '_id.timestamp': -1 } },
        { $group: { _id: '$_id.block', doc: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$doc' } },
        { $sort: { '_id.timestamp': -1 } },
        { $skip: page * limit },
        { $limit: limit },
      ])
      .then((blocks) => blocks.map((block) => new this.blockModel(block)));
  }

  async countAllOfOrganization(organizationId: string): Promise<number> {
    return this.blockModel
      .aggregate([
        { $match: { '_id.organization': organizationId } },
        { $sort: { '_id.timestamp': -1 } },
        { $group: { _id: '$_id.block', doc: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$doc' } },
        { $sort: { '_id.timestamp': -1 } },
      ])
      .then((blocks) => blocks.length);
  }

  findOne(organizationId: string, blockId: string): Promise<Block> {
    return this.blockModel.findOne(
      {
        '_id.block': blockId,
        '_id.organization': organizationId,
      },
      {},
      {
        sort: { '_id.timestamp': -1 },
      },
    );
  }

  remove(organizationId: string, blockId: string) {
    this.logger.log('Deleting block');
    return this.blockModel.deleteMany({
      '_id.block': blockId,
      '_id.organization': organizationId,
    });
  }

  createExampleBlocks(
    organizationId: string,
    domain: string,
  ): Promise<Block[]> {
    this.logger.log('Creating 3 example blocks');

    const exampleBlocks = [
      new Block({
        _id: {
          block: ExampleBlockIds.HEADER_1,
          organization: organizationId,
          timestamp: Date.now(),
        },
        displayName: this.i18n.t('blocks.header_1.displayName'),
        description: this.i18n.t('blocks.header_1.description'),
        code:
          '<header>\n' +
          '    <img src="' +
          domain +
          '/assets/imgs/logo_purple.png" width="80" class="block m-auto"/>\n' +
          '    <h3 class="text-center">' +
          organizationId +
          '</h3>\n' +
          '</header>',
        wysiwygEnabled: false,
        isArchived: false,
        parameters: [],
      }),
      new Block({
        _id: {
          block: ExampleBlockIds.FOOTER_1,
          organization: organizationId,
          timestamp: Date.now(),
        },
        displayName: this.i18n.t('blocks.footer_1.displayName'),
        description: this.i18n.t('blocks.footer_1.description'),
        code:
          '<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">\n' +
          '    <tr>\n' +
          '        <td align="center">\n' +
          '            <!-- Image/logo section -->\n' +
          '            <img src="https://via.placeholder.com/50" alt="Company Logo" style="display: block; max-width: 150px; height: auto; margin-bottom: 20px;" />\n' +
          '        </td>\n' +
          '    </tr>\n' +
          '    <tr>\n' +
          '        <td align="center" style="color: #555555; font-size: 12px; line-height: 18px; text-align: center; padding: 10px 0;">\n' +
          '            <!-- Mentions légales -->\n' +
          `            <p style="margin: 0;">© 2024 ${organizationId}. Tous droits réservés.</p>\n` +
          `            <p style="margin: 0;">123 Rue de l'Entreprise, 75000 Paris, France</p>\n` +
          '            <p style="margin: 0;">Numéro SIRET : 123 456 789 00012</p>\n' +
          `            <p style="margin: 0;">[Ajouter d'autres informations légales si nécessaire]</p>\n` +
          '        </td>\n' +
          '    </tr>\n' +
          '    <tr>\n' +
          '        <td align="center" style="padding: 20px 0;">\n' +
          '            <!-- Lien de désinscription -->\n' +
          '            <a href="[URL_DE_DESINSCRIPTION]" style="color: #007BFF; text-decoration: none; font-size: 12px;">Se désinscrire</a>\n' +
          '        </td>\n' +
          '    </tr>\n' +
          '</table>\n',
        wysiwygEnabled: false,
        isArchived: false,
        parameters: [],
      }),
      new Block({
        _id: {
          block: ExampleBlockIds.ARTICLE_1,
          organization: organizationId,
          timestamp: Date.now(),
        },
        displayName: this.i18n.t('blocks.article_1.displayName'),
        description: this.i18n.t('blocks.article_1.description'),
        code:
          '<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; padding: 20px; font-family: Arial, sans-serif;">\n' +
          '    <tr>\n' +
          "        <!-- Section de l'image de l'article -->\n" +
          '        <td align="center" style="padding-bottom: 30px;">\n' +
          `            <img src="https://via.placeholder.com/600x200" alt="Image de l'article" style="display: block; max-width: 100%; height: auto; border-radius: 5px;" />\n` +
          '        </td>\n' +
          '    </tr>\n' +
          '    <tr>\n' +
          "        <!-- Titre de l'article -->\n" +
          '        <td align="center" style="padding: 10px 0;">\n' +
          `            <h2 style="font-size: 20px; color: #333333; margin: 0;">Titre de l'Article</h2>\n` +
          '        </td>\n' +
          '    </tr>\n' +
          '    <tr>\n' +
          "        <!-- Description de l'article -->\n" +
          '        <td align="center" style="padding: 10px 0 20px 0; color: #555555; font-size: 14px; line-height: 22px;">\n' +
          `            <p style="margin: 0; padding: 0 20px;">Ceci est une description de l'article. Vous pouvez y décrire brièvement le contenu, les points principaux ou les informations que vous souhaitez mettre en avant. Ajoutez autant de détails que nécessaire pour susciter l'intérêt du lecteur.</p>\n` +
          '        </td>\n' +
          '    </tr>\n' +
          '    <tr>\n' +
          "        <!-- Lien de l'article -->\n" +
          '        <td align="center" style="padding: 20px 0;">\n' +
          `            <a href="[URL_DE_L_ARTICLE]" style="background-color: #007BFF; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 14px;">Lire l'article</a>\n` +
          '        </td>\n' +
          '    </tr>\n' +
          '</table>\n',
        wysiwygEnabled: false,
        isArchived: false,
        parameters: [],
      }),
    ];

    return this.blockModel.insertMany(exampleBlocks);
  }
}

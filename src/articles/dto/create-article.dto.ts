import { Article } from '../schemas/article.schema';
import { PickType } from '@nestjs/swagger';

export class CreateArticleDto extends PickType(Article, [
  'url',
  'feeds',
  'metadata',
]) {}

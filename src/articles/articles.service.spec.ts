import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service';
import { getModelToken } from '@nestjs/mongoose';
import { Article } from './schemas/article.schema';
import { TestUtils } from '../shared/utils/test.utils';

const mockArticleModel = {
  save: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  insertMany: jest.fn(),
  deleteMany: jest.fn(),
  deleteOne: jest.fn(),
};

describe('ArticlesService', () => {
  let service: ArticlesService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      providers: [
        ArticlesService,
        { provide: getModelToken(Article.name), useValue: mockArticleModel },
      ],
    });

    service = module.get<ArticlesService>(ArticlesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

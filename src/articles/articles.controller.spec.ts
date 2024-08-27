import { TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
import { TestUtils } from '../shared/utils/test.utils';

describe('ArticlesController', () => {
  let controller: ArticlesController;

  beforeEach(async () => {
    const module: TestingModule =
      await TestUtils.createTestingModuleForContents({
        controllers: [ArticlesController],
        providers: [],
      });

    controller = module.get<ArticlesController>(ArticlesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

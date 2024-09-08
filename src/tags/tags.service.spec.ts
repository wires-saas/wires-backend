import { TestingModule } from '@nestjs/testing';
import { TagsService } from './tags.service';
import { TestUtils } from '../shared/utils/test.utils';

describe('TagsService', () => {
  let service: TagsService;

  beforeEach(async () => {
    const module: TestingModule =
      await TestUtils.createTestingModuleForContents({
        providers: [TagsService],
      });

    service = module.get<TagsService>(TagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

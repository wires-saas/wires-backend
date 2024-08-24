import { TestingModule } from '@nestjs/testing';
import { FeedsService } from './feeds.service';
import { TestUtils } from '../shared/utils/test.utils';

describe('FeedsService', () => {
  let service: FeedsService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      providers: [FeedsService],
      controllers: [],
    });

    service = module.get<FeedsService>(FeedsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

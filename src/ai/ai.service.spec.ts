import { TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { TestUtils } from '../shared/utils/test.utils';

const mockAiService = {
  createGPT: jest.fn(),
};

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      providers: [{ provide: AiService, useValue: mockAiService }],
    });

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

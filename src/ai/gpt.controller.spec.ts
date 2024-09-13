import { TestingModule } from '@nestjs/testing';
import { GptController } from './gpt.controller';
import { AiService } from './ai.service';
import { TestUtils } from '../shared/utils/test.utils';
import { GptService } from './gpt.service';

const mockAiService = {
  createGPT: jest.fn(),
};

const mockGptService = {
  request: jest.fn(),
};

describe('GptController', () => {
  let controller: GptController;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      controllers: [GptController],
      providers: [
        { provide: AiService, useValue: mockAiService },
        { provide: GptService, useValue: mockGptService },
      ],
    });

    controller = module.get<GptController>(GptController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

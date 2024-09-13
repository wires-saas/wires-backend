import { Test, TestingModule } from '@nestjs/testing';
import { GptController } from './gpt.controller';
import { AiService } from './ai.service';

describe('GptController', () => {
  let controller: GptController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GptController],
      providers: [AiService],
    }).compile();

    controller = module.get<GptController>(GptController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

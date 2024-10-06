import { TestingModule } from '@nestjs/testing';
import { BlocksService } from './blocks.service';
import { TestUtils } from '../shared/utils/test.utils';
import { Block } from './schemas/block.schema';
import { getModelToken } from '@nestjs/mongoose';

const mockBlockModel = {
  save: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  insertMany: jest.fn(),
  deleteMany: jest.fn(),
  deleteOne: jest.fn(),
};

describe('BlocksService', () => {
  let service: BlocksService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      providers: [
        BlocksService,
        {
          provide: getModelToken(Block.name),
          useValue: mockBlockModel,
        },
      ],
    });

    service = module.get<BlocksService>(BlocksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

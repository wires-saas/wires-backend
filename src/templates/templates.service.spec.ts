import { TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';
import { TestUtils } from '../shared/utils/test.utils';
import { Block } from './schemas/template.schema';
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
  let service: TemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      providers: [
        TemplatesService,
        {
          provide: getModelToken(Block.name),
          useValue: mockBlockModel,
        },
      ],
    });

    service = module.get<TemplatesService>(TemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';
import { TestUtils } from '../shared/utils/test.utils';
import { getModelToken } from '@nestjs/mongoose';
import { Template } from './schemas/template.schema';

const mockTemplateModel = {
  save: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  insertMany: jest.fn(),
  deleteMany: jest.fn(),
  deleteOne: jest.fn(),
};

describe('TemplatesService', () => {
  let service: TemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      providers: [
        TemplatesService,
        {
          provide: getModelToken(Template.name),
          useValue: mockTemplateModel,
        },
      ],
    });

    service = module.get<TemplatesService>(TemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

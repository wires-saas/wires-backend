import { TestingModule } from '@nestjs/testing';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { TestUtils } from '../shared/utils/test.utils';

const mockTemplatesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAllOfOrganization: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('TemplatesController', () => {
  let controller: TemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      controllers: [TemplatesController],
      providers: [
        {
          provide: TemplatesService,
          useValue: mockTemplatesService,
        },
      ],
    });

    controller = module.get<TemplatesController>(TemplatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

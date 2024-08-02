import { TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { TestUtils } from '../../shared/utils/test.utils';

const mockPermissionsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  remove: jest.fn(),
};

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let service: typeof mockPermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
      ],
    });

    controller = module.get<PermissionsController>(PermissionsController);
    service = module.get<typeof mockPermissionsService>(PermissionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});

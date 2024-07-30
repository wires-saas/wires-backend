import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { SuperAdminGuard } from '../../auth/super-admin.guard';

const mockRolesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockSuperAdminGuard = {
  canActivate: jest.fn(),
};

describe('RolesController', () => {
  let controller: RolesController;
  let service: typeof mockRolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
        {
          provide: SuperAdminGuard,
          useValue: mockSuperAdminGuard,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<typeof mockRolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});

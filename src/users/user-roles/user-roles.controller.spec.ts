import { TestingModule } from '@nestjs/testing';
import { UserRolesController } from './user-roles.controller';
import { UserRolesService } from './user-roles.service';
import { TestUtils } from '../../shared/utils/test.utils';

const mockUserRolesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UserRolesController', () => {
  let controller: UserRolesController;
  let service: typeof mockUserRolesService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      controllers: [UserRolesController],
      providers: [
        { provide: UserRolesService, useValue: mockUserRolesService },
      ],
    });

    controller = module.get<UserRolesController>(UserRolesController);
    service = module.get<typeof mockUserRolesService>(UserRolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});

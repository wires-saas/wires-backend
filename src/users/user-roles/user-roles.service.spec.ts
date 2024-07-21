import { Test, TestingModule } from '@nestjs/testing';
import { UserRolesService } from './user-roles.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserRoleColl } from '../schemas/user-role.schema';

const mockUserRoleModel = {
  save: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  insertMany: jest.fn(),
  deleteMany: jest.fn(),
  deleteOne: jest.fn(),
};

describe('UserRolesService', () => {
  let service: UserRolesService;
  let userRoleModel: typeof mockUserRoleModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRolesService,
        { provide: getModelToken(UserRoleColl), useValue: mockUserRoleModel },
      ],
    }).compile();

    service = module.get<UserRolesService>(UserRolesService);
    userRoleModel = module.get(getModelToken(UserRoleColl));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userRoleModel).toBeDefined();
  });
});

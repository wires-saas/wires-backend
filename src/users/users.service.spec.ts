import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { EncryptService } from '../services/security/encrypt.service';
import { User } from './schemas/user.schema';
import { HashService } from '../services/security/hash.service';
import { UserRolesService } from './user-roles/user-roles.service';
import { OrganizationPlansService } from '../organizations/organization-plans.service';

const mockUserModel = {
  save: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

const mockUserRolesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockOrganizationPlansService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockEncryptService = {
  encrypt: jest.fn(),
  decrypt: jest.fn(),
};

const mockHashService = {
  hash: jest.fn(),
  compare: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let userModel: typeof mockUserModel;
  let encryptService: typeof mockEncryptService;
  let hashService: typeof mockHashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: OrganizationPlansService,
          useValue: mockOrganizationPlansService,
        },
        { provide: UserRolesService, useValue: mockUserRolesService },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: EncryptService, useValue: mockEncryptService },
        { provide: HashService, useValue: mockHashService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));
    encryptService = module.get(EncryptService);
    hashService = module.get(HashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userModel).toBeDefined();
    expect(encryptService).toBeDefined();
    expect(hashService).toBeDefined();
  });
});

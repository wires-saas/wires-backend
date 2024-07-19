import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { EncryptService } from '../commons/encrypt.service';
import { User } from './schemas/user.schema';
import { HashService } from '../commons/hash.service';

const mockUserModel = {
  save: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
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

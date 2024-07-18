import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { EncryptService } from '../commons/encrypt.service';
import { User } from './schemas/user.schema';

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

describe('UsersService', () => {
  let service: UsersService;
  let userModel: typeof mockUserModel;
  let encryptService: typeof mockEncryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: EncryptService, useValue: mockEncryptService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));
    encryptService = module.get(EncryptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userModel).toBeDefined();
    expect(encryptService).toBeDefined();
  });
});

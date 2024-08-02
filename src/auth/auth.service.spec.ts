import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { HashService } from '../services/security/hash.service';
import { JwtService } from '@nestjs/jwt';
import { EncryptService } from '../services/security/encrypt.service';

// mock of users service
const mockUsersService = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findOneByEmail: jest.fn(),
};

// mock of hash service
const mockHashService = {
  hash: jest.fn(),
  compare: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockEncryptService = {
  encrypt: jest.fn(),
  decrypt: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: typeof mockUsersService;
  let hashService: typeof mockHashService;
  let jwtService: typeof mockJwtService;
  let encryptService: typeof mockEncryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: HashService, useValue: mockHashService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EncryptService, useValue: mockEncryptService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<typeof mockUsersService>(UsersService);
    hashService = module.get<typeof mockHashService>(HashService);
    jwtService = module.get<typeof mockJwtService>(JwtService);
    encryptService = module.get<typeof mockEncryptService>(EncryptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(usersService).toBeDefined();
    expect(hashService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(encryptService).toBeDefined();
  });
});

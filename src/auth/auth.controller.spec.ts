import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';

import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

const mockAuthService = {
  signIn: jest.fn(),
};

const mockUsersService = {
  findOneByEmail: jest.fn(),
};

const mockAuthGuard = {
  canActivate: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: typeof mockAuthService;
  let usersService: typeof mockUsersService;
  let guard: typeof mockAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthGuard, useValue: mockAuthGuard },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
      ],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<typeof mockAuthService>(AuthService);
    usersService = module.get<typeof mockUsersService>(UsersService);
    guard = module.get<typeof mockAuthGuard>(AuthGuard);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(usersService).toBeDefined();
    expect(guard).toBeDefined();
  });
});

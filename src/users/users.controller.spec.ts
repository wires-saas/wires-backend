import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CaslAbilityFactory } from '../rbac/casl/casl-ability.factory';
import { AuthGuard } from '../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../services/email/email.service';
import { UserRolesService } from './user-roles/user-roles.service';

const mockUsersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findOneByEmail: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockUserRolesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const authGuardMock = {
  canActivate: jest.fn(),
};

const mockCaslAbilityFactory = {
  createForUser: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockEmailService = {
  sendTestEmail: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: typeof mockUsersService;
  let caslAbilityFactory: typeof mockCaslAbilityFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: UserRolesService, useValue: mockUserRolesService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: CaslAbilityFactory, useValue: mockCaslAbilityFactory },
        { provide: AuthGuard, useValue: authGuardMock },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<typeof mockUsersService>(UsersService);
    caslAbilityFactory =
      module.get<typeof mockCaslAbilityFactory>(CaslAbilityFactory);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(caslAbilityFactory).toBeDefined();
  });
});

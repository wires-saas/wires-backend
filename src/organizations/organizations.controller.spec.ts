import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { CaslAbilityFactory } from '../rbac/casl/casl-ability.factory';
import { AuthGuard } from '../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

const mockOrganizationsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockCaslAbilityFactory = {
  createForUser: jest.fn(),
};

const authGuardMock = {
  canActivate: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockUsersService = {
  findOneByEmail: jest.fn(),
};

describe('OrganizationsController', () => {
  let controller: OrganizationsController;
  let service: typeof mockOrganizationsService;
  let caslAbilityFactory: typeof mockCaslAbilityFactory;
  let guard: typeof authGuardMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [
        { provide: OrganizationsService, useValue: mockOrganizationsService },
        { provide: CaslAbilityFactory, useValue: mockCaslAbilityFactory },
        { provide: AuthGuard, useValue: authGuardMock },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<OrganizationsController>(OrganizationsController);
    service = module.get<typeof mockOrganizationsService>(OrganizationsService);
    caslAbilityFactory =
      module.get<typeof mockCaslAbilityFactory>(CaslAbilityFactory);
    guard = module.get<typeof authGuardMock>(AuthGuard);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(caslAbilityFactory).toBeDefined();
    expect(guard).toBeDefined();
  });
});

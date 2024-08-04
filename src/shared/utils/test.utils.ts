import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { SuperAdminGuard } from '../../auth/super-admin.guard';
import { AuthGuard } from '../../auth/auth.guard';
import { CaslAbilityFactory } from '../../rbac/casl/casl-ability.factory';
import { EncryptService } from '../../services/security/encrypt.service';
import { HashService } from '../../services/security/hash.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { EmailService } from '../../services/email/email.service';

export class TestUtils {
  static createTestingModule(metadata: ModuleMetadata): Promise<TestingModule> {
    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockUsersService = {
      findOneByEmail: jest.fn(),
    };

    const mockSuperAdminGuard = {
      canActivate: jest.fn(),
    };

    const authGuardMock = {
      canActivate: jest.fn(),
    };

    const mockCaslAbilityFactory = {
      createForUser: jest.fn(),
    };

    const mockHashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const mockEncryptService = {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    };

    const mockOrganizationsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const mockEmailService = {
      sendEmail: jest.fn(),
    };

    return Test.createTestingModule({
      controllers: [...metadata.controllers],
      providers: [
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: OrganizationsService, useValue: mockOrganizationsService },
        {
          provide: SuperAdminGuard,
          useValue: mockSuperAdminGuard,
        },
        { provide: AuthGuard, useValue: authGuardMock },
        { provide: CaslAbilityFactory, useValue: mockCaslAbilityFactory },

        { provide: EncryptService, useValue: mockEncryptService },
        { provide: HashService, useValue: mockHashService },

        { provide: EmailService, useValue: mockEmailService },

        ...metadata.providers,
      ],
    }).compile();
  }
}

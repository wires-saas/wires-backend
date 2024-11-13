import { TestingModule } from '@nestjs/testing';
import { TestUtils } from '../../shared/utils/test.utils';
import { OrganizationCreationController } from './organization-creation.controller';
import { OrganizationCreationService } from './organization-creation.service';
import { OrganizationPlansService } from '../../organizations/organization-plans.service';
import { RolesService } from '../../rbac/roles/roles.service';
import { UserRolesService } from '../../users/user-roles/user-roles.service';

const mockOrganizationCreationService = {
  checkOrganizationCreationInviteToken: jest.fn(),
  useOrganizationCreationInviteToken: jest.fn(),
};

const mockOrganizationPlansService = {
  getOrganizationPlan: jest.fn(),
};

const mockRolesService = {
  createBasicRolesForNewOrganization: jest.fn(),
};

const mockUserRolesService = {
  assignUserRole: jest.fn(),
};

describe('OrganizationCreationController', () => {
  let controller: OrganizationCreationController;
  let service: typeof mockOrganizationCreationService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      providers: [
        {
          provide: OrganizationCreationService,
          useValue: mockOrganizationCreationService,
        },
        {
          provide: OrganizationPlansService,
          useValue: mockOrganizationPlansService,
        },
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
        {
          provide: UserRolesService,
          useValue: mockUserRolesService,
        },
      ],
      controllers: [OrganizationCreationController],
    });

    controller = module.get<OrganizationCreationController>(
      OrganizationCreationController,
    );
    service = module.get<typeof mockOrganizationCreationService>(
      OrganizationCreationService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});

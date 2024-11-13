import { TestingModule } from '@nestjs/testing';
import { TestUtils } from '../../shared/utils/test.utils';
import { OrganizationCreationService } from './organization-creation.service';

const mockOrganizationPlansService = {
  checkOrganizationCreationInviteToken: jest.fn(),
  useOrganizationCreationInviteToken: jest.fn(),
};

describe('OrganizationCreationService', () => {
  let service: OrganizationCreationService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      providers: [
        OrganizationCreationService,
        {
          provide: OrganizationCreationService,
          useValue: mockOrganizationPlansService,
        },
      ],
      controllers: [],
    });

    service = module.get<OrganizationCreationService>(
      OrganizationCreationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { TestingModule } from '@nestjs/testing';
import { OrganizationCreationService } from './organization-creation.service';
import { TestUtils } from '../../../shared/utils/test.utils';

describe('OrganizationCreationService', () => {
  let service: OrganizationCreationService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      providers: [OrganizationCreationService],
    });

    service = module.get<OrganizationCreationService>(
      OrganizationCreationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

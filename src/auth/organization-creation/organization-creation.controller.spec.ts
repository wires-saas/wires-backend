import { TestingModule } from '@nestjs/testing';
import { TestUtils } from '../../shared/utils/test.utils';
import { OrganizationCreationController } from './organization-creation.controller';

describe('OrganizationCreationController', () => {
  let controller: OrganizationCreationController;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      providers: [],
      controllers: [OrganizationCreationController],
    });

    controller = module.get<OrganizationCreationController>(
      OrganizationCreationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

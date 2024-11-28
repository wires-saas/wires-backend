import { TestingModule } from '@nestjs/testing';
import { OrganizationsController } from './organizations.controller';
import { TestUtils } from '../shared/utils/test.utils';

describe('OrganizationsController', () => {
  let controller: OrganizationsController;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      controllers: [OrganizationsController],
      providers: [],
    });

    controller = module.get<OrganizationsController>(OrganizationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

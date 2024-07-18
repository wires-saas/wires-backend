import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';
import { getModelToken } from '@nestjs/mongoose';
import { Organization } from './schemas/organization.schema';

const mockOrganizationModel = {
  save: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};
describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let organizationModel: typeof mockOrganizationModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: getModelToken(Organization.name),
          useValue: mockOrganizationModel,
        },
      ],
    }).compile();

    organizationModel = module.get(getModelToken(Organization.name));
    service = module.get<OrganizationsService>(OrganizationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(organizationModel).toBeDefined();
  });
});

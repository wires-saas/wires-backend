import { TestingModule } from '@nestjs/testing';
import { StripeController } from './stripe.controller';
import { WebhooksService } from './webhooks.service';
import { TestUtils } from '../shared/utils/test.utils';
import { OrganizationPlansService } from '../organizations/organization-plans.service';

const mockWebhooksService = {
  createStripeEvent: jest.fn(() => true),
  findAll: jest.fn(() => true),
};

const mockOrganizationPlansService = {
  create: jest.fn(() => true),
  findOneBySubscriptionId: jest.fn(() => true),
};

describe('WebhooksController', () => {
  let controller: StripeController;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      controllers: [StripeController],
      providers: [
        {
          provide: WebhooksService,
          useValue: mockWebhooksService,
        },
        {
          provide: OrganizationPlansService,
          useValue: mockOrganizationPlansService,
        },
      ],
    });

    controller = module.get<StripeController>(StripeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

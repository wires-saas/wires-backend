import { TestingModule } from '@nestjs/testing';
import { StripeController } from './stripe.controller';
import { WebhooksService } from './webhooks.service';
import { TestUtils } from '../shared/utils/test.utils';

const mockWebhooksService = {
  createStripeEvent: jest.fn(() => true),
  findAll: jest.fn(() => true),
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
      ],
    });

    controller = module.get<StripeController>(StripeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

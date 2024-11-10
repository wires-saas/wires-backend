import { Test, TestingModule } from '@nestjs/testing';
import { StripeController } from './stripe.controller';
import { WebhooksService } from './webhooks.service';

describe('WebhooksController', () => {
  let controller: StripeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeController],
      providers: [WebhooksService],
    }).compile();

    controller = module.get<StripeController>(StripeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

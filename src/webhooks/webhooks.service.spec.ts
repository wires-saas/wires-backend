import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksService } from './webhooks.service';
import { getModelToken } from '@nestjs/mongoose';
import { WebhookEventColl } from './schemas/webhook-event.schema';

const mockWebhookEventModel = {
  find: jest.fn().mockReturnThis(),
  exec: jest.fn(),
  save: jest.fn(),
};

describe('WebhooksService', () => {
  let service: WebhooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        {
          provide: getModelToken(WebhookEventColl),
          useValue: mockWebhookEventModel,
        },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

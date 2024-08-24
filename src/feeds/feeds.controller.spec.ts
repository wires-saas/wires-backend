import { TestingModule } from '@nestjs/testing';
import { FeedsController } from './feeds.controller';
import { FeedsService } from './feeds.service';
import { TestUtils } from '../shared/utils/test.utils';
import { MongooseModule } from '@nestjs/mongoose';
import { Feed, FeedSchema } from './schemas/feed.schema';

const mockFeedService = {
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findOne: jest.fn(),
};

describe('FeedsController', () => {
  let controller: FeedsController;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      imports: [
        MongooseModule.forFeature([{ name: Feed.name, schema: FeedSchema }]),
      ],
      controllers: [FeedsController],
      providers: [{ provide: FeedsService, useValue: mockFeedService }],
    });

    controller = module.get<FeedsController>(FeedsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

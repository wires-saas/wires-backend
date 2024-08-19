import { TestingModule } from '@nestjs/testing';
import { UserNotificationsService } from './user-notifications.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserNotificationColl } from '../schemas/user-notification.schema';
import { TestUtils } from '../../shared/utils/test.utils';

const mockUserNotificationModel = {
  save: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findOneAndReplace: jest.fn(),
  insertMany: jest.fn(),
  deleteMany: jest.fn(),
  deleteOne: jest.fn(),
};

describe('UserNotificationsService', () => {
  let service: UserNotificationsService;
  let userNotificationModel: typeof mockUserNotificationModel;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      providers: [
        UserNotificationsService,
        {
          provide: getModelToken(UserNotificationColl),
          useValue: mockUserNotificationModel,
        },
      ],
      controllers: [],
    });

    service = module.get<UserNotificationsService>(UserNotificationsService);
    userNotificationModel = module.get(getModelToken(UserNotificationColl));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userNotificationModel).toBeDefined();
  });
});

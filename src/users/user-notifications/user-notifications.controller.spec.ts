import { TestingModule } from '@nestjs/testing';
import { UserNotificationsController } from './user-notifications.controller';
import { UserNotificationsService } from './user-notifications.service';
import { TestUtils } from '../../shared/utils/test.utils';

const mockUserNotificationsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UserNotificationsController', () => {
  let controller: UserNotificationsController;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      controllers: [UserNotificationsController],
      providers: [
        {
          provide: UserNotificationsService,
          useValue: mockUserNotificationsService,
        },
      ],
    });

    controller = module.get<UserNotificationsController>(
      UserNotificationsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

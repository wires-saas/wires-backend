import { TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { EmailService } from '../services/email/email.service';
import { UserRolesService } from './user-roles/user-roles.service';
import { TestUtils } from '../shared/utils/test.utils';

const mockUserRolesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockEmailService = {
  sendTestEmail: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UserRolesService, useValue: mockUserRolesService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    });

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { TestingModule } from '@nestjs/testing';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';
import { TestUtils } from '../shared/utils/test.utils';
import { FolderItemsService } from './folder-items.service';
import { BlocksService } from '../blocks/blocks.service';

const mockFoldersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAllOfOrganization: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockFolderItemsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAllOfType: jest.fn(),
  findAllOfOrganization: jest.fn(),
  findAllOfOrganizationAndType: jest.fn(),
  findOne: jest.fn(),
  findAllOfFolder: jest.fn(),
  remove: jest.fn(),
};

const mockBlocksService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAllOfOrganization: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('FoldersController', () => {
  let controller: FoldersController;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      controllers: [FoldersController],
      providers: [
        {
          provide: FoldersService,
          useValue: mockFoldersService,
        },
        {
          provide: FolderItemsService,
          useValue: mockFolderItemsService,
        },
        {
          provide: BlocksService,
          useValue: mockBlocksService,
        },
      ],
    });

    controller = module.get<FoldersController>(FoldersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

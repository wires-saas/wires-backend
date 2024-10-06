import { Test, TestingModule } from '@nestjs/testing';
import { FolderItemsService } from './folder-items.service';
import { FolderItemColl } from './schemas/folder-item.schema';
import { getModelToken } from '@nestjs/mongoose';

const mockFolderItemModel = {
  save: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  insertMany: jest.fn(),
  deleteMany: jest.fn(),
  deleteOne: jest.fn(),
};

describe('FolderItemsService', () => {
  let service: FolderItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FolderItemsService,
        {
          provide: getModelToken(FolderItemColl),
          useValue: mockFolderItemModel,
        },
      ],
    }).compile();

    service = module.get<FolderItemsService>(FolderItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

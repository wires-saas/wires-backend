import { TestingModule } from '@nestjs/testing';
import { FoldersService } from './folders.service';
import { TestUtils } from '../shared/utils/test.utils';
import { Folder } from './schemas/folder.schema';
import { getModelToken } from '@nestjs/mongoose';

const mockFolderModel = {
  save: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  insertMany: jest.fn(),
  deleteMany: jest.fn(),
  deleteOne: jest.fn(),
};

describe('FoldersService', () => {
  let service: FoldersService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      providers: [
        FoldersService,
        {
          provide: getModelToken(Folder.name),
          useValue: mockFolderModel,
        },
      ],
    });

    service = module.get<FoldersService>(FoldersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

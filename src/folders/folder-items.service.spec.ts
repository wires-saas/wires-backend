import { Test, TestingModule } from '@nestjs/testing';
import { FolderItemsService } from './folder-items.service';

describe('FolderItemsService', () => {
  let service: FolderItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FolderItemsService],
    }).compile();

    service = module.get<FolderItemsService>(FolderItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

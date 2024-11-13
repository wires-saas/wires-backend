import { Module } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SecurityModule } from '../services/security/security.module';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { FolderItemsService } from './folder-items.service';
import { Folder, FolderSchema } from './schemas/folder.schema';
import { FolderItemColl, FolderItemSchema } from './schemas/folder-item.schema';
import { BlocksModule } from '../blocks/blocks.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Folder.name, schema: FolderSchema },
      { name: FolderItemColl, schema: FolderItemSchema },
    ]),
    SecurityModule,
    UsersModule,
    OrganizationsModule,
    BlocksModule,
  ],
  controllers: [FoldersController],
  providers: [FoldersService, FolderItemsService],
})
export class FoldersModule {}

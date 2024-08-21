import { Module } from '@nestjs/common';
import { SecurityModule } from '../security/security.module';
import { FileUploadService } from './file-upload.service';

@Module({
  imports: [SecurityModule],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}

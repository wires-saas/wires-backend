import { Module } from '@nestjs/common';
import { EncryptService } from './encrypt.service';
import { HashService } from './hash.service';

@Module({
  providers: [EncryptService, HashService],
  exports: [EncryptService, HashService],
})
export class SecurityModule {}

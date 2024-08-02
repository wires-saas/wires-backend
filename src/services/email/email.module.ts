import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendGridClient } from './sendgrid-client';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [SecurityModule],
  providers: [EmailService, SendGridClient],
  exports: [EmailService, SendGridClient],
})
export class EmailModule {}

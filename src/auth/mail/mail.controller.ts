import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('mail')
export class MailController {
  constructor(private configService: ConfigService) {}
  @Get('invitation')
  getInvitationEmail(@Res() res: Response) {
    const file = 'email-invitation.ejs';

    return res.render(file, {
      appName: this.configService.get('appName'),
      theme: this.configService.get('theme'),
      ...this.configService.get('urls'),

      fullName: 'Abc Def',
      orgName: 'Alphabet Corporation',
    });
  }
}

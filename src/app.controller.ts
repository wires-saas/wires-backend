import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  getHello(): string {
    return this.appService.getHello();
  }

  @Get('version')
  getVersion(): string {
    return this.appService.getVersion();
  }
}

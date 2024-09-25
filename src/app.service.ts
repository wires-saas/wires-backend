import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private logger: Logger;
  constructor(private configService: ConfigService) {
    this.logger = new Logger(AppService.name);
    this.logger.log('AppService created');
    this.logger.log(
      'Environment set to ' + this.configService.getOrThrow('env'),
    );
    this.logger.log(
      'Dashboard served from ' + this.configService.getOrThrow('appUrl'),
    );
    this.logger.log(
      'Default language set to ' +
        this.configService.getOrThrow('fallbackLanguage'),
    );
  }

  getHello(): string {
    return 'Hello World!';
  }
}

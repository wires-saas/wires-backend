import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { config as readEnvFile } from 'dotenv';

@Injectable()
export class HashService {
  private rounds: number = 10;
  private salt: string;
  private logger: Logger;

  constructor() {
    this.logger = new Logger(HashService.name);
    readEnvFile();
    this.salt = process.env.HASH_SALT;
    console.log(this.salt);
  }

  async hash(str: string): Promise<string> {
    return bcrypt.hash(this.salt + str, this.rounds);
  }

  async compare(str: string, hash: string): Promise<boolean> {
    this.logger.log('Comparing hash');
    this.logger.log(str);
    this.logger.log(this.salt + str);
    this.logger.log(hash);
    return bcrypt.compare(this.salt + str, hash);
  }
}

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  private rounds: number = 10;
  private salt: string;

  constructor() {
    this.salt = process.env.HASH_SALT;
  }

  async hash(str: string): Promise<string> {
    return bcrypt.hash(this.salt + str, this.rounds);
  }

  async compare(str: string, hash: string): Promise<boolean> {
    return bcrypt.compare(this.salt + str, hash);
  }
}

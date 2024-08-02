import { Injectable } from '@nestjs/common';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

@Injectable()
export class EncryptService {
  private cipher: any;

  constructor() {
    const keyParsed = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    this.cipher = this.aes256gcm(keyParsed);
  }

  encrypt(str: string): string {
    return this.cipher.encrypt(str);
  }

  decrypt(enc: string): string {
    return this.cipher.decrypt(enc);
  }

  private aes256gcm(key) {
    const encrypt = (str) => {
      const iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key, iv);

      const enc1 = cipher.update(str, 'utf8');
      const enc2 = cipher.final();
      return Buffer.concat([enc1, enc2, iv, cipher.getAuthTag()]).toString(
        'base64',
      );
    };

    const decrypt = (enc) => {
      enc = Buffer.from(enc, 'base64');
      const iv = enc.slice(enc.length - 28, enc.length - 16);
      const tag = enc.slice(enc.length - 16);
      enc = enc.slice(0, enc.length - 28);
      const decipher = createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(tag);
      let str = decipher.update(enc, null, 'utf8');
      str += decipher.final('utf8');
      return str;
    };

    return {
      encrypt,
      decrypt,
    };
  }
}

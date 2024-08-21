import { Injectable, Logger } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class FileUploadService {
  private logger: Logger;
  private client: Minio.Client;

  constructor() {
    this.logger = new Logger(FileUploadService.name);
    this.logger.log('FileUploadService initialized');

    this.client = new Minio.Client({
      endPoint: 'play.min.io',
      port: 9000,
      useSSL: true,
      accessKey: 'Q3AM3UQ867SPQQA43P2F',
      secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG',
    });
  }

  test(): string {
    return 'FileUploadService is working';
  }

  async uploadFile(
    bucketName: string,
    objectName: string,
    file: Express.Multer.File,
  ): Promise<void> {
    const exists = await this.client.bucketExists(bucketName);
    if (exists) {
      console.log('Bucket  exists.');
    } else {
      await this.client.makeBucket(bucketName, 'us-east-1');
      console.log('Bucket ' + bucketName + ' created in "us-east-1".');
    }

    const metadata = {
      'Content-Type': file.mimetype,
      'X-Amz-Meta-Testing': 1234,
      example: 5678,
    };

    await this.client.putObject(
      bucketName,
      objectName,
      file.buffer,
      file.size,
      metadata,
    );
  }

  async getFile(bucketName: string, objectName: string): Promise<any> {
    return this.client.getObject(bucketName, objectName);
  }
}

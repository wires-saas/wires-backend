import { Injectable, Logger } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadService {
  private logger: Logger = new Logger(FileUploadService.name);
  private client: Minio.Client;

  constructor(private configService: ConfigService) {
    this.logger.log('FileUploadService initialized');

    this.client = new Minio.Client({
      endPoint: this.configService.getOrThrow('S3_url'),
      port: parseInt(this.configService.getOrThrow('S3_port'), 10),
      useSSL: false,
      accessKey: this.configService.getOrThrow('S3_accessKey'),
      secretKey: this.configService.getOrThrow('S3_secretKey'),
    });
  }

  async uploadFile(
    bucketName: string,
    objectName: string,
    file: Express.Multer.File,
  ): Promise<void> {
    const metadata = {
      'Content-Type': file.mimetype,
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

  async removeFile(bucketName: string, objectName: string): Promise<void> {
    await this.client.removeObject(bucketName, objectName);
  }
}

import { Injectable } from '@nestjs/common';
import { FileUploadService } from '../../services/file-upload/file-upload.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserAvatarsService {
  private readonly avatarBucket: string;
  private readonly avatarPrefix: string = 'avatars/';

  constructor(
    private fileUploadService: FileUploadService,
    private configService: ConfigService,
  ) {
    this.avatarBucket = this.configService.getOrThrow('S3_publicBucket');
  }

  async create(userId: string, avatar: Express.Multer.File) {
    const fileName = `${this.avatarPrefix}${userId}`;

    await this.fileUploadService.uploadFile(
      this.avatarBucket,
      fileName,
      avatar,
    );

    return 'Avatar uploaded';
  }

  async findOne(userId: string) {
    const fileName = `${this.avatarPrefix}${userId}`;
    return this.fileUploadService.getFile(this.avatarBucket, fileName);
  }

  remove(userId: string) {
    const fileName = `${this.avatarPrefix}${userId}`;
    return this.fileUploadService.removeFile(this.avatarBucket, fileName);
  }
}

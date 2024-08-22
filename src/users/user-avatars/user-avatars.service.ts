import { Injectable, Logger } from '@nestjs/common';
import { FileUploadService } from '../../services/file-upload/file-upload.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserAvatarsService {
  private logger = new Logger(UserAvatarsService.name);
  private readonly avatarBucket: string;
  private readonly avatarPrefix: string = 'avatars';

  public static readonly DEFAULT_AVATAR: string = 'avatar.png';

  constructor(
    private fileUploadService: FileUploadService,
    private configService: ConfigService,
  ) {
    this.avatarBucket = this.configService.getOrThrow('S3_publicBucket');
  }

  async create(
    userId: string,
    avatarName: string,
    avatar: Express.Multer.File,
  ) {
    const fileName = `${this.avatarPrefix}/${userId}/${avatarName}`;

    await this.fileUploadService.uploadFile(
      this.avatarBucket,
      fileName,
      avatar,
    );

    return avatarName;
  }

  async findOne(userId: string, avatarName: string) {
    let fileName = `${this.avatarPrefix}/${userId}/${avatarName}`;

    // Default avatar not scoped to user
    if (avatarName === UserAvatarsService.DEFAULT_AVATAR) {
      fileName = `${this.avatarPrefix}/${avatarName}`;
    }

    return this.fileUploadService.getFile(this.avatarBucket, fileName);
  }

  remove(userId: string, avatarName: string) {
    if (avatarName === UserAvatarsService.DEFAULT_AVATAR) {
      this.logger.warn('Cannot remove default avatar');
      return;
    }

    const fileName = `${this.avatarPrefix}/${userId}/${avatarName}`;
    return this.fileUploadService.removeFile(this.avatarBucket, fileName);
  }
}

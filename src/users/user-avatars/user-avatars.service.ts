import { Injectable } from '@nestjs/common';
import { UpdateUserAvatarDto } from '../dto/update-user-avatar.dto';
import { FileUploadService } from '../../services/file-upload/file-upload.service';

@Injectable()
export class UserAvatarsService {
  constructor(private fileUploadService: FileUploadService) {}

  async create(userId: string, avatar: Express.Multer.File) {
    console.log(this.fileUploadService.test());

    await this.fileUploadService.uploadFile('avatars', userId, avatar);

    return 'This action adds a new userAvatar to ' + userId;
  }

  async findOne(userId: string) {
    return this.fileUploadService.getFile('avatars', userId);
  }

  remove(id: number) {
    return `This action removes a #${id} userAvatar`;
  }
}

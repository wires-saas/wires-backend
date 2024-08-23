import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Request,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Logger,
  StreamableFile,
  Header,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserAvatarsService } from './user-avatars.service';
import {
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { AuthenticatedRequest } from '../../shared/types/authentication.types';
import { CaslAbilityFactory } from '../../rbac/casl/casl-ability.factory';
import { Action } from '../../rbac/permissions/entities/action.entity';
import { User } from '../schemas/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from '../users.service';

@ApiTags('Users (Avatars)')
@Controller('users')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiNotFoundResponse({ description: 'User not found' })
export class UserAvatarsController {
  private logger: Logger;
  constructor(
    private readonly userAvatarsService: UserAvatarsService,
    private readonly usersService: UsersService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {
    this.logger = new Logger(UserAvatarsController.name);
  }

  @Post(':userId/avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async create(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2621440 }), // 2.5 MB
          new FileTypeValidator({ fileType: /png|jpeg|jpg/i }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<{ fileName: string }> {
    const ability = this.caslAbilityFactory.createForUser(req.user);

    if (ability.cannot(Action.Update, User)) {
      throw new UnauthorizedException('Cannot update user avatar');
    }

    const fileExtension: string = file.originalname.split('.').pop();

    const allowedExtensions = ['png', 'jpeg', 'jpg'];
    if (!allowedExtensions.includes(fileExtension)) {
      throw new ForbiddenException('Invalid file extension');
    }

    if (!allowedExtensions.find((ext) => file.mimetype.endsWith(ext))) {
      throw new ForbiddenException('Invalid file type');
    }

    const fileName: string = Date.now() + '.' + fileExtension;

    const user = await this.usersService.findOne(userId, false);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatarName !== UserAvatarsService.DEFAULT_AVATAR) {
      await this.userAvatarsService.remove(userId, user.avatarName);
    }

    await this.usersService.updateAvatar(userId, fileName);

    await this.userAvatarsService.create(userId, fileName, file);

    return { fileName };
  }

  @Get(':userId/avatar/:avatarName')
  @Header('Cache-Control', 'public, max-age=31536000')
  async findOne(
    @Param('userId') userId: string,
    @Param('avatarName') avatarName: string,
  ): Promise<StreamableFile> {
    const file = await this.userAvatarsService
      .findOne(userId, avatarName)
      .catch((err) => {
        this.logger.error('User avatar not found', err);
        throw new NotFoundException('User avatar not found');
      });

    const contentType =
      file.headers['content-type'] ||
      file.headers['Content-Type'] ||
      (file.name?.endsWith('png') ? 'image/png' : 'image/jpeg');

    return new StreamableFile(file, { type: contentType });
  }

  @Delete(':userId/avatar')
  @UseGuards(AuthGuard)
  async remove(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    const ability = this.caslAbilityFactory.createForUser(req.user);

    const user: User = await this.usersService.findOne(userId, false);

    if (ability.cannot(Action.Update, user)) {
      throw new UnauthorizedException('Cannot delete user avatar');
    }

    // Reinstate default avatar
    await this.usersService.updateAvatar(
      userId,
      UserAvatarsService.DEFAULT_AVATAR,
    );

    return this.userAvatarsService.remove(userId, user.avatarName);
  }
}

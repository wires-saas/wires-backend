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

@ApiTags('Users (Avatars)')
@Controller('users')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiNotFoundResponse({ description: 'User not found' })
export class UserAvatarsController {
  private logger: Logger;
  constructor(
    private readonly userAvatarsService: UserAvatarsService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {
    this.logger = new Logger(UserAvatarsController.name);
  }

  @Post(':userId/avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000000 }), // put in env variable
          new FileTypeValidator({ fileType: /png|jpeg|jpg/i }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const ability = this.caslAbilityFactory.createForUser(req.user);

    if (ability.cannot(Action.Update, User)) {
      throw new UnauthorizedException('Cannot update user avatar');
    }

    this.logger.debug(file.size);

    return this.userAvatarsService.create(userId, file);
  }

  @Get(':userId/avatar')
  @Header('Cache-Control', 'public, max-age=2592000')
  async findOne(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ): Promise<StreamableFile> {
    const file = await this.userAvatarsService.findOne(userId);

    const contentType =
      file.headers['content-type'] ||
      file.headers['Content-Type'] ||
      'application/octet-stream';

    return new StreamableFile(file, { type: contentType });
  }

  @Delete(':userId/avatar')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.userAvatarsService.remove(+id);
  }
}

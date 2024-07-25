import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { HashService } from '../commons/hash.service';
import { JwtService } from '@nestjs/jwt';
import { EncryptService } from '../commons/encrypt.service';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private hashService: HashService,
    private jwtService: JwtService,
    private encryptService: EncryptService,
  ) {}

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ access_token: string; user: User }> {
    const user = await this.usersService.findOneByEmail(email).catch(() => {
      // obfuscate the error message
      throw new UnauthorizedException();
    });
    const passwordMatches = await this.hashService.compare(pass, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException();
    }

    const clearEmail = this.encryptService.decrypt(user.email);

    const payload = { sub: user._id.toString(), email: clearEmail };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: user,
    };
  }

  signOut() {
    return;
  }
}

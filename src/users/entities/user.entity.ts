import { UserStatus } from './user-status.entity';
import { UserEmailStatus } from './user-email-status.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class User {
  id: string;
  firstName: string;
  lastName: string;
  @Exclude()
  isSuperAdmin: boolean;
  isOrgAdmin: boolean;
  @ApiProperty({ enum: UserStatus, enumName: 'UserStatus' })
  status: UserStatus;

  email: string;
  @ApiProperty({ enum: UserEmailStatus, enumName: 'UserEmailStatus' })
  emailStatus: UserEmailStatus;
  emailChangeCandidate?: string;

  @Exclude()
  password: string;
  @Exclude()
  passwordResetToken?: string;
  passwordResetTokenExpiresAt?: number;

  @Exclude()
  emailVerificationToken?: string;
  emailVerificationTokenExpiresAt?: number;

  lastSeenAt?: number;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

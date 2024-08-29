import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserStatus } from '../entities/user-status.entity';
import { UserEmailStatus } from '../entities/user-email-status.entity';
import { UserRole } from './user-role.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  virtuals: {
    organizations: {
      get(): string[] {
        return [
          ...new Set(this.roles.map((role: UserRole) => role.organization)),
        ] as string[];
      },
    },
    avatarUrl: {
      get(): string {
        return (
          process.env.API_URL +
          '/v1/users/' +
          this._id +
          '/avatar/' +
          this.avatarName
        );
      },
    },
  },
  toObject: {
    //delete __v from output object
    versionKey: false,
    virtuals: ['avatarUrl'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      delete ret.password;
      delete ret.avatarName;
      delete ret.inviteToken;
      delete ret.passwordResetToken;
      delete ret.passwordResetTokenExpiresAt;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationTokenExpiresAt;
      return ret;
    },
  },
  toJSON: {
    //delete __v from output JSON
    versionKey: false,
    virtuals: ['avatarUrl'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: function (_, ret, __) {
      delete ret.password;
      delete ret.avatarName;
      delete ret.passwordResetToken;
      delete ret.passwordResetTokenExpiresAt;
      delete ret.inviteToken;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationTokenExpiresAt;
      return ret;
    },
  },
})
export class User {
  _id: string;

  @Prop({ required: true }) // not specify it will throw, resulting in error 500
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  isSuperAdmin: boolean;

  avatarUrl: string; // virtual

  @Prop()
  avatarName: string;

  @Prop()
  status: UserStatus;

  @Prop()
  street: string;

  @Prop()
  city: string;

  @Prop()
  zipCode: string;

  @Prop()
  country: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  emailStatus: UserEmailStatus;

  @Prop()
  emailChangeCandidate: string;

  @Prop()
  inviteToken: string;

  @Prop()
  inviteTokenExpiresAt: number;

  @Prop()
  password: string;

  @Prop()
  passwordResetToken: string;

  @Prop()
  passwordResetTokenExpiresAt: number;

  @Prop()
  emailVerificationToken: string;

  @Prop()
  emailVerificationTokenExpiresAt: number;

  @Prop()
  lastSeenAt?: number;

  @Prop()
  roles: UserRole[];

  organizations?: UserRole['organization'][];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CaslModule } from './rbac/casl/casl.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationsModule } from './organizations/organizations.module';

import { config as readEnvFile } from 'dotenv';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './rbac/roles/roles.module';
import { PermissionsModule } from './rbac/permissions/permissions.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../environments/environment';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { join } from 'path';
import { FeedsModule } from './feeds/feeds.module';
import { ArticlesModule } from './articles/articles.module';
import { TagsModule } from './tags/tags.module';
import { AiModule } from './ai/ai.module';
import { BlocksModule } from './blocks/blocks.module';
import { FoldersModule } from './folders/folders.module';
import { ContactsProvidersModule } from './providers/contacts-providers/contacts-providers.module';

readEnvFile();
const connectionString = process.env.MONGO_URI;

@Module({
  imports: [
    CaslModule,
    UsersModule,
    HealthModule,
    MongooseModule.forRoot(connectionString),
    OrganizationsModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('fallbackLanguage'),
        loaderOptions: {
          path: join(__dirname, 'i18n/'),
          watch: true,
        },
        formatter: (template: string, args) => {
          // Custom formatter as the default wasn't working...
          return Object.keys(args).reduce((res, key) => {
            const doubleSpace = res.replaceAll('{ ' + key + ' }', args[key]);
            return doubleSpace.replaceAll('{' + key + '}', args[key]);
          }, template);
        },
        // typesOutputPath: join(__dirname, '../i18n/generated/i18n.generated.ts'),
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
      inject: [ConfigService],
    }),
    FeedsModule,
    ArticlesModule,
    TagsModule,
    AiModule,
    BlocksModule,
    FoldersModule,
    ContactsProvidersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

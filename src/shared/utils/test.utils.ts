import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { SuperAdminGuard } from '../../auth/super-admin.guard';
import { AuthGuard } from '../../auth/auth.guard';
import { CaslAbilityFactory } from '../../rbac/casl/casl-ability.factory';
import { EncryptService } from '../../services/security/encrypt.service';
import { HashService } from '../../services/security/hash.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { EmailService } from '../../services/email/email.service';
import { ConfigService } from '@nestjs/config';
import { FileUploadService } from '../../services/file-upload/file-upload.service';
import { FeedsService } from '../../feeds/feeds.service';
import { ArticlesService } from '../../articles/articles.service';
import { FeedRunsService } from '../../feeds/runs/feed-runs.service';
import { getModelToken } from '@nestjs/mongoose';
import { FeedRunColl } from '../../feeds/schemas/feed-run.schema';
import { Feed } from '../../feeds/schemas/feed.schema';
import { Article } from '../../articles/schemas/article.schema';
import { ScrapingService } from '../../services/scraping/scraping.service';
import { Tag } from '../../tags/schemas/tag.schema';
import { TagsService } from '../../tags/tags.service';

export class TestUtils {
  static createModel() {
    return {
      save: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      insertMany: jest.fn(),
      deleteMany: jest.fn(),
      deleteOne: jest.fn(),
    };
  }

  static createTestingModule(metadata: ModuleMetadata): Promise<TestingModule> {
    const mockConfigService = {
      get: jest.fn(),
      getOrThrow: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockUsersService = {
      findOneByEmail: jest.fn(),
    };

    const mockSuperAdminGuard = {
      canActivate: jest.fn(),
    };

    const authGuardMock = {
      canActivate: jest.fn(),
    };

    const mockCaslAbilityFactory = {
      createForUser: jest.fn(),
    };

    const mockHashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const mockEncryptService = {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    };

    const mockOrganizationsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const mockEmailService = {
      sendEmail: jest.fn(),
    };

    const mockFileUploadService = {
      uploadFile: jest.fn(),
      getFile: jest.fn(),
      removeFile: jest.fn(),
    };

    return Test.createTestingModule({
      imports: metadata.imports ? [...metadata.imports] : [],
      controllers: metadata.controllers ? [...metadata.controllers] : [],
      providers: [
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: OrganizationsService, useValue: mockOrganizationsService },
        {
          provide: SuperAdminGuard,
          useValue: mockSuperAdminGuard,
        },
        { provide: AuthGuard, useValue: authGuardMock },
        { provide: CaslAbilityFactory, useValue: mockCaslAbilityFactory },

        { provide: EncryptService, useValue: mockEncryptService },
        { provide: HashService, useValue: mockHashService },

        { provide: EmailService, useValue: mockEmailService },

        { provide: FileUploadService, useValue: mockFileUploadService },

        ...metadata.providers,
      ],
    }).compile();
  }

  static createTestingModuleForContents(
    metadata: ModuleMetadata,
  ): Promise<TestingModule> {
    const mockConfigService = {
      get: jest.fn(),
      getOrThrow: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockUsersService = {
      findOneByEmail: jest.fn(),
    };

    const mockOrganizationsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const authGuardMock = {
      canActivate: jest.fn(),
    };

    const mockCaslAbilityFactory = {
      createForUser: jest.fn(),
    };

    const mockHashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const mockEncryptService = {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    };

    const mockFeedService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const mockFeedRunService = {
      findAllRunsOfFeeds: jest.fn(),
      runFeed: jest.fn(),
      findAllRunsOfFeed: jest.fn(),
      findRunOfFeed: jest.fn(),
    };

    const mockArticleService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const mockTagsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const mockScrapingService = {
      scrapeFeed: jest.fn(),
    };

    return Test.createTestingModule({
      imports: metadata.imports ? [...metadata.imports] : [],
      controllers: metadata.controllers ? [...metadata.controllers] : [],
      providers: [
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: OrganizationsService, useValue: mockOrganizationsService },
        { provide: AuthGuard, useValue: authGuardMock },
        { provide: CaslAbilityFactory, useValue: mockCaslAbilityFactory },

        { provide: EncryptService, useValue: mockEncryptService },
        { provide: HashService, useValue: mockHashService },

        { provide: FeedsService, useValue: mockFeedService },
        { provide: FeedRunsService, useValue: mockFeedRunService },
        { provide: ArticlesService, useValue: mockArticleService },
        { provide: ScrapingService, useValue: mockScrapingService },
        { provide: TagsService, useValue: mockTagsService },

        {
          provide: getModelToken(Feed.name),
          useValue: TestUtils.createModel(),
        },
        {
          provide: getModelToken(FeedRunColl),
          useValue: TestUtils.createModel(),
        },
        {
          provide: getModelToken(Article.name),
          useValue: TestUtils.createModel(),
        },
        { provide: getModelToken(Tag.name), useValue: TestUtils.createModel() },

        ...metadata.providers,
      ],
    }).compile();
  }
}

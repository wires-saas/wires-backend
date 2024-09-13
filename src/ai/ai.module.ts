import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { GptController } from './gpt.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { SecurityModule } from '../services/security/security.module';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { aiModels } from '../shared/mongoose-models';
import { GptService } from './gpt.service';

@Module({
  imports: [
    MongooseModule.forFeature(aiModels),
    SecurityModule,
    UsersModule,
    OrganizationsModule,
  ],
  controllers: [GptController],
  providers: [AiService, GptService],
})
export class AiModule {}

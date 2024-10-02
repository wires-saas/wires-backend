import { Injectable, Logger } from '@nestjs/common';
import { CreateGptDto } from './dto/create-gpt.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gpt } from './schemas/gpt.schema';
import { EncryptService } from '../services/security/encrypt.service';
import { UpdateGptUsageDto } from './dto/update-gpt-usage.dto';
import { GptUsage } from './schemas/gpt-usage.schema';
import { AuthenticationType } from './entities/ai.entities';

// This service allows to manipulate abstract AI entities.

@Injectable()
export class AiService {
  private logger: Logger = new Logger(AiService.name);

  constructor(
    @InjectModel(Gpt.name) private gptModel: Model<Gpt>,
    private encryptService: EncryptService,
  ) {}

  private convertToEntity(createGptDto: CreateGptDto): Gpt {
    return new Gpt({
      model: createGptDto.model,
      organization: createGptDto.organization,

      usage: {
        requestsUsage: 0,
        requestsLimit: createGptDto.requestsLimit,
        tokensUsage: 0,
        tokensLimit: createGptDto.tokensLimit,
      },

      authentication: {
        type: createGptDto.authenticationType,
        apiKey: this.encryptService.encrypt(createGptDto.apiKey),
      },
    });
  }

  private mergeUsage(
    gptUsage: GptUsage,
    updateGptUsageDto: UpdateGptUsageDto,
  ): GptUsage {
    Object.entries(updateGptUsageDto).forEach(([key, value]) => {
      gptUsage[key] = value;
    });

    return gptUsage;
  }

  createGPT(createGptDto: CreateGptDto): Promise<Gpt> {
    return new this.gptModel(this.convertToEntity(createGptDto)).save();
  }

  async updateGPT(
    gptId: string,
    updateGptUsageDto: UpdateGptUsageDto,
  ): Promise<Gpt> {
    const gpt: Gpt = await this.gptModel.findById(gptId).exec();

    return this.gptModel
      .findOneAndUpdate(
        { _id: gptId },
        {
          usage: this.mergeUsage(gpt.usage, updateGptUsageDto),
        },
        { new: true },
      )
      .exec();
  }

  async findAllGPTs(): Promise<Gpt[]> {
    return this.gptModel.find().exec();
  }

  async findAllGPTsOfOrganization(organizationId: string): Promise<Gpt[]> {
    return this.gptModel.find({ organization: organizationId }).exec();
  }

  async findOne(gptId: string): Promise<Gpt> {
    const gpt: Gpt = await this.gptModel.findById(gptId).exec();

    if (gpt.authentication.type === AuthenticationType.API_KEY) {
      gpt.authentication.apiKey = this.encryptService.decrypt(
        gpt.authentication.apiKey,
      );
    }

    return gpt;
  }

  async removeGPT(id: string) {
    return this.gptModel.deleteOne({ _id: id }).exec();
  }
}

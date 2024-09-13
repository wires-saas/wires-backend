import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gpt } from './schemas/gpt.schema';
import { GptRequest, GptRequestColl } from './schemas/gpt-request.schema';
import { GptFactory } from './entities/gpt.factory';
import { RequestGptDto } from './dto/request-gpt.dto';
import { GptGenerationResult, GptRequestStatus } from './entities/ai.entities';

// This service is responsible for handling the GPT requests.

@Injectable()
export class GptService {
  private readonly logger: Logger = new Logger(GptService.name);

  constructor(
    @InjectModel(Gpt.name) private gptModel: Model<Gpt>,
    @InjectModel(GptRequestColl) private gptRequestModel: Model<GptRequest>,
  ) {}

  async request(abstractGpt: Gpt, request: RequestGptDto): Promise<GptRequest> {
    const gpt = GptFactory.create(abstractGpt);
    this.logger.log(`Prompt: ${request.prompt}`);

    const generationResult = await gpt.request(request.prompt);

    return await new this.gptRequestModel({
      gpt: abstractGpt._id,
      prompt: generationResult.prompt,
      response: generationResult.response,
      status: GptRequestStatus.SUCCESS,
      inputTokens: generationResult.inputTokens,
      outputTokens: generationResult.outputTokens,
      totalTokens: generationResult.totalTokens,
    }).save();
  }

  async findAll(): Promise<GptRequest[]> {
    return this.gptRequestModel.find({}).exec();
  }
}

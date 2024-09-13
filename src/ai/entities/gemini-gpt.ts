import { Gpt } from '../schemas/gpt.schema';
import {
  GenerateContentResult,
  GoogleGenerativeAI,
} from '@google/generative-ai';
import { GptGenerationResult } from './ai.entities';

export class GeminiGpt extends Gpt {
  constructor(partial: Partial<Gpt>) {
    super({
      _id: partial._id,
      model: partial.model,
      organization: partial.organization,
      usage: partial.usage,
      authentication: partial.authentication,
    });
  }

  async request(prompt: string): Promise<GptGenerationResult> {
    const genAI = new GoogleGenerativeAI(this.authentication.apiKey);
    const model = genAI.getGenerativeModel({
      model: this.model,
    });

    // const inputTokens: CountTokensResponse = await model.countTokens(prompt);

    const generation: GenerateContentResult =
      await model.generateContent(prompt);

    return {
      inputTokens: generation.response.usageMetadata.promptTokenCount,
      outputTokens: generation.response.usageMetadata.candidatesTokenCount,
      totalTokens: generation.response.usageMetadata.totalTokenCount,
      prompt: prompt,
      response: generation.response.text(),
    };
  }
}

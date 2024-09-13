import { SupportedGPT } from './ai.entities';
import { Gpt } from '../schemas/gpt.schema';
import { GeminiGpt } from './gemini-gpt';

export class GptFactory {
  static create(gpt: Gpt): Gpt {
    switch (gpt.model) {
      case SupportedGPT.GEMINI_FLASH_1_5:
        return new GeminiGpt(gpt);
      default:
        throw new Error('Factory cannot process unknown GPT type');
    }
  }
}

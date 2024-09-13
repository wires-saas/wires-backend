import { SupportedGPT } from '../../ai/entities/ai.entities';

export class AiUtils {
  static getWebsite(gpt: SupportedGPT) {
    switch (gpt) {
      case SupportedGPT.GEMINI_FLASH_1_5:
        return 'https://gemini.google.com/app';
    }
  }

  static getTerms(gpt: SupportedGPT) {
    switch (gpt) {
      case SupportedGPT.GEMINI_FLASH_1_5:
        return 'https://policies.google.com/terms';
    }
  }
}

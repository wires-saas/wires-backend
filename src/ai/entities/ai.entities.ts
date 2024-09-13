export enum SupportedGPT {
  GEMINI_FLASH_1_5 = 'gemini-1.5-flash',
}

export enum AuthenticationType {
  API_KEY = 'apiKey',
}

export enum GptRequestStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface GptGenerationResult {
  prompt: string;
  response: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

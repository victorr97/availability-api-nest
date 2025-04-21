import { Test, TestingModule } from '@nestjs/testing';
import { MarketingService } from '@features/marketing/marketing.service';

// Mock the context builder to always return a fixed context string
jest.mock('@features/marketing/utils/context/buildMarketingContext', () => ({
  buildMarketingContext: jest.fn().mockReturnValue('mocked context'),
}));
// Mock the system prompt utility to always return a fixed prompt string
jest.mock('@features/marketing/utils/marketing.prompt', () => ({
  getSystemPrompt: jest.fn().mockReturnValue('mocked system prompt'),
}));
// Mock the Ollama client to always resolve with a fixed response
jest.mock('@features/marketing/utils/clients/ollama-client', () => ({
  askOllama: jest.fn().mockResolvedValue('mocked ollama response'),
}));
// Mock the Bedrock client to always resolve with a fixed response
jest.mock('@features/marketing/utils/clients/bedrock-client', () => ({
  askBedrock: jest.fn().mockResolvedValue('mocked bedrock response'),
}));

describe('MarketingService', () => {
  let service: MarketingService;

  beforeEach(async () => {
    // Set up the testing module and inject the MarketingService
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketingService],
    }).compile();

    service = module.get<MarketingService>(MarketingService);
  });

  it('should be defined', () => {
    // Checks that the service is properly instantiated
    expect(service).toBeDefined();
  });

  it('should return insight from Ollama', async () => {
    // Ensures that when LLM_PROVIDER is 'ollama', the service returns the mocked Ollama response
    process.env.LLM_PROVIDER = 'ollama';
    const result = await service.getInsights({ prompt: 'test prompt' });
    expect(result).toEqual({ insight: 'mocked ollama response' });
  });

  it('should return insight from Bedrock', async () => {
    // Ensures that when LLM_PROVIDER is 'bedrock', the service returns the mocked Bedrock response
    process.env.LLM_PROVIDER = 'bedrock';
    const result = await service.getInsights({ prompt: 'test prompt' });
    expect(result).toEqual({ insight: 'mocked bedrock response' });
  });
});

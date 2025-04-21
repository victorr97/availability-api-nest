import { Test, TestingModule } from '@nestjs/testing';
import { MarketingService } from '@features/marketing/marketing.service';

jest.mock('@features/marketing/utils/context/buildMarketingContext', () => ({
  buildMarketingContext: jest.fn().mockReturnValue('mocked context'),
}));
jest.mock('@features/marketing/utils/marketing.prompt', () => ({
  getSystemPrompt: jest.fn().mockReturnValue('mocked system prompt'),
}));
jest.mock('@features/marketing/utils/clients/ollama-client', () => ({
  askOllama: jest.fn().mockResolvedValue('mocked ollama response'),
}));
jest.mock('@features/marketing/utils/clients/bedrock-client', () => ({
  askBedrock: jest.fn().mockResolvedValue('mocked bedrock response'),
}));

describe('MarketingService', () => {
  let service: MarketingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketingService],
    }).compile();

    service = module.get<MarketingService>(MarketingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return insight from Ollama', async () => {
    process.env.LLM_PROVIDER = 'ollama';
    const result = await service.getInsights({ prompt: 'test prompt' });
    expect(result).toEqual({ insight: 'mocked ollama response' });
  });

  it('should return insight from Bedrock', async () => {
    process.env.LLM_PROVIDER = 'bedrock';
    const result = await service.getInsights({ prompt: 'test prompt' });
    expect(result).toEqual({ insight: 'mocked bedrock response' });
  });
});

import { Injectable } from '@nestjs/common';
import { buildMarketingContext } from '@features/marketing/utils/context/buildMarketingContext';
import { getSystemPrompt } from '@features/marketing/utils/marketing.prompt';
import { askOllama } from '@features/marketing/utils/clients/ollama-client';
import { askBedrock } from '@features/marketing/utils/clients/bedrock-client';

@Injectable()
export class MarketingService {
  async getInsights(query: { prompt: string }) {
    try {
      const context = buildMarketingContext(query.prompt);
      const systemPrompt = getSystemPrompt();

      console.log('--- CONTEXTO ENVIADO AL LLM ---');
      console.log('[Marketing] User Prompt:', query.prompt);
      console.log('[Marketing] Context:', context);

      let response: string;

      const provider = process.env.LLM_PROVIDER || 'ollama';

      if (provider === 'bedrock') {
        response = await askBedrock({
          model:
            process.env.BEDROCK_MODEL_ID ||
            'anthropic.claude-3-sonnet-20240229-v1:0',
          systemPrompt,
          userPrompt: `${context}\n\n${query.prompt}`,
        });
      } else {
        response = await askOllama({
          model: 'mistral',
          systemPrompt,
          userPrompt: `${context}\n\n${query.prompt}`,
        });
      }

      return { insight: response };
    } catch (error) {
      console.error('[Marketing] --- ERROR EN getInsights ---');
      console.error('[Marketing]', error);
      throw error;
    }
  }
}

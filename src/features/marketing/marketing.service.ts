import { Injectable } from '@nestjs/common';
import { buildMarketingContext } from '@features/marketing/utils/context/buildMarketingContext';
import { getSystemPrompt } from '@features/marketing/utils/marketing.prompt';
import { askOllama } from '@features/marketing/utils/clients/ollama-client';
import { askBedrock } from '@features/marketing/utils/clients/bedrock-client';

@Injectable()
export class MarketingService {
  /**
   * Generates a marketing insight using an LLM provider (Ollama or Bedrock).
   * Builds a context from the user prompt, selects the provider, and returns the generated insight.
   * @param query - Object containing the user prompt
   * @returns An object with the generated insight (in Spanish)
   */
  async getInsights(query: { prompt: string }) {
    try {
      // Build the context string based on the user prompt
      const context = buildMarketingContext(query.prompt);
      // Get the system prompt (instructions for the LLM)
      const systemPrompt = getSystemPrompt();

      // Log the prompt and context for debugging purposes
      console.log('--- CONTEXTO ENVIADO AL LLM ---');
      console.log('[Marketing] User Prompt:', query.prompt);
      console.log('[Marketing] Context:', context);

      let response: string;

      // Select the LLM provider based on environment variable (default: ollama)
      const provider = process.env.LLM_PROVIDER || 'ollama';

      if (provider === 'bedrock') {
        // Use Bedrock as the LLM provider
        response = await askBedrock({
          model:
            process.env.BEDROCK_MODEL_ID ||
            'anthropic.claude-3-sonnet-20240229-v1:0',
          systemPrompt,
          userPrompt: `${context}\n\n${query.prompt}`,
        });
      } else {
        // Use Ollama as the LLM provider
        response = await askOllama({
          model: 'mistral',
          systemPrompt,
          userPrompt: `${context}\n\n${query.prompt}`,
        });
      }

      // Return the generated insight (always in Spanish)
      return { insight: response };
    } catch (error) {
      // Log and rethrow any errors that occur during the process
      console.error('[Marketing] --- ERROR EN getInsights ---');
      console.error('[Marketing]', error);
      throw error;
    }
  }
}

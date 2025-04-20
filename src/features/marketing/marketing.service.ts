import { Injectable } from '@nestjs/common';
import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
  RetrieveAndGenerateCommandInput,
} from '@aws-sdk/client-bedrock-agent-runtime';
import { getMarketingPrompt } from '@features/marketing/utils/marketing.prompt';

@Injectable()
export class MarketingService {
  private bedrock = new BedrockAgentRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  async getInsights(query: any) {
    try {
      const userPrompt = getMarketingPrompt(query.prompt);

      const input: RetrieveAndGenerateCommandInput = {
        input: { text: userPrompt },
        retrieveAndGenerateConfiguration: {
          type: 'KNOWLEDGE_BASE',
          knowledgeBaseConfiguration: {
            knowledgeBaseId: process.env.BEDROCK_KB_ID as string,
            modelArn: process.env.BEDROCK_MODEL_ARN as string,
          },
        },
      };

      const command = new RetrieveAndGenerateCommand(input);
      const response = await this.bedrock.send(command);

      return { insight: response.output?.text || 'Sin respuesta de la KB.' };
    } catch (error) {
      console.error('Bedrock KB error:', error);
      throw error;
    }
  }
}

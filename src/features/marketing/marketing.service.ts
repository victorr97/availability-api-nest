import { Injectable } from '@nestjs/common';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

@Injectable()
export class MarketingService {
  private bedrock = new BedrockRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  async getInsights(query: any) {
    try {
      const userPrompt = `
Eres un asistente experto en marketing para una plataforma de actividades turísticas.

Analiza los datos de disponibilidad y demanda proporcionados y responde de forma clara, concisa y profesional, en español.

Instrucciones importantes:
- Destaca las actividades con alta demanda y baja disponibilidad (por ejemplo, "se están agotando rápido").
- Identifica las ciudades o venues que están mostrando tendencias destacadas en la disponibilidad (al alza o a la baja).
- No repitas la pregunta del usuario ni uses introducciones.
- Da recomendaciones accionables y directas para el equipo de marketing.
- Si no hay datos suficientes para alguna parte, indícalo brevemente.

${query.prompt}
`;

      const input = {
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          // eslint-disable-next-line camelcase
          anthropic_version: 'bedrock-2023-05-31',
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          // eslint-disable-next-line camelcase
          max_tokens: 512,
          temperature: 0.2,
        }),
      };

      const command = new InvokeModelCommand(input);
      const response = await this.bedrock.send(command);

      const responseBody = await response.body.transformToString();
      const result = JSON.parse(responseBody);

      return { insight: result.content || result.completion || responseBody };
    } catch (error) {
      console.error('Bedrock error:', error);
      throw error;
    }
  }
}

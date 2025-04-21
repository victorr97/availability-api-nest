import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

export async function askBedrock({
  model,
  systemPrompt,
  userPrompt,
}: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {
  const body = {
    // eslint-disable-next-line camelcase
    anthropic_version: 'bedrock-2023-05-31',
    // eslint-disable-next-line camelcase
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `${systemPrompt}\n\n${userPrompt}`,
      },
    ],
  };

  const command = new InvokeModelCommand({
    modelId: model,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(body),
  });

  const response = await client.send(command);
  const completion = JSON.parse(new TextDecoder().decode(response.body));
  return (
    completion.content?.[0]?.text ||
    completion.content ||
    'Sin respuesta del modelo'
  );
}

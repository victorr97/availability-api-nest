import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

// Initialize the AWS Bedrock runtime client with the region from environment variables
const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

/**
 * Sends a prompt to the specified Bedrock model and returns the generated response.
 * @param model - The model ID to use (e.g., 'anthropic.claude-v2')
 * @param systemPrompt - The system prompt (instructions/context for the model)
 * @param userPrompt - The user prompt (actual user question or input)
 * @returns The model's response as a string
 */
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
    anthropic_version: 'bedrock-2023-05-31', // Required version field for Bedrock API
    // eslint-disable-next-line camelcase
    max_tokens: 1000, // Maximum number of tokens to generate in the response
    messages: [
      {
        role: 'user',
        content: `${systemPrompt}\n\n${userPrompt}`, // Combine system and user prompts
      },
    ],
  };

  // Prepare the command to invoke the Bedrock model
  const command = new InvokeModelCommand({
    modelId: model,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(body),
  });

  // Send the command and parse the response
  const response = await client.send(command);
  const completion = JSON.parse(new TextDecoder().decode(response.body));
  // Return the generated text or a fallback message if not present
  return (
    completion.content?.[0]?.text ||
    completion.content ||
    'Sin respuesta del modelo'
  );
}

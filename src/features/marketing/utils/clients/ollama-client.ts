import fetch from 'node-fetch';

/**
 * Sends a prompt to the specified Ollama model and returns the generated response.
 * @param model - The model name to use (e.g., 'llama2')
 * @param systemPrompt - The system prompt (instructions/context for the model)
 * @param userPrompt - The user prompt (actual user question or input)
 * @returns The model's response as a string
 */
export async function askOllama({
  model,
  systemPrompt,
  userPrompt,
}: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {
  const response = await fetch('http://ollama:11434/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      // eslint-disable-next-line camelcase
      max_tokens: 1000, // Use snake_case as required by the Ollama API spec
    }),
  });

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  // Return the generated content or a fallback message if not present
  return (
    data.choices?.[0]?.message?.content?.trim() || 'Sin respuesta del modelo'
  );
}

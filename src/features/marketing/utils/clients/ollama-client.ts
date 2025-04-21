import fetch from 'node-fetch';

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
      max_tokens: 1000,
    }),
  });

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  return (
    data.choices?.[0]?.message?.content?.trim() || 'Sin respuesta del modelo'
  );
}

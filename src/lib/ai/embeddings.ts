import { providerConfig, providerSwitches } from './providers';
import { embeddingCache } from './cache';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
}

const DEFAULT_EMBEDDING: EmbeddingResult = {
  embedding: [],
  model: 'none',
};

/**
 * Hosted embedding call (Together/Fireworks style compatible with OpenAI embedding schema).
 */
export async function embedText(text: string): Promise<EmbeddingResult> {
  if (!providerSwitches.enableEmbeddings) return DEFAULT_EMBEDDING;
  const { provider, model, baseUrl, apiKey } = providerConfig.embeddings;
  if (!apiKey) return DEFAULT_EMBEDDING;

  const cached = embeddingCache.get(text);
  if (cached) return cached;

  const url =
    baseUrl ||
    (provider === 'fireworks'
      ? 'https://api.fireworks.ai/inference/v1/embeddings'
      : 'https://api.together.xyz/v1/embeddings');

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [text.slice(0, 8000)],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Embedding error: ${res.status} ${body}`);
    }

    const data = await res.json();
    const vector = data.data?.[0]?.embedding as number[] | undefined;
    if (!Array.isArray(vector)) return DEFAULT_EMBEDDING;

    const result = { embedding: vector, model };
    embeddingCache.set(text, result);
    return result;
  } catch (error) {
    console.warn('embedText fallback:', error);
    return DEFAULT_EMBEDDING;
  }
}

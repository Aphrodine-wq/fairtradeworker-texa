import { embedText } from './embeddings';
import { providerConfig, providerSwitches } from './providers';

export interface RetrievedDocument {
  id?: string;
  title?: string;
  content?: string;
  metadata?: Record<string, any>;
  score?: number;
}

export interface RAGContext {
  similarScopes: RetrievedDocument[];
  materialPricing: RetrievedDocument[];
  suggestedContractors: RetrievedDocument[];
  averagePrice?: number;
  typicalTimeframe?: string;
}

interface VectorQueryRequest {
  collection: string;
  vector: number[];
  topK: number;
  filter?: Record<string, any>;
}

const EMPTY_CONTEXT: RAGContext = {
  similarScopes: [],
  materialPricing: [],
  suggestedContractors: [],
  averagePrice: undefined,
  typicalTimeframe: undefined,
};

export async function getJobContext(jobDescription: string): Promise<RAGContext> {
  if (!providerSwitches.enableRag) return EMPTY_CONTEXT;

  const { embedding } = await embedText(jobDescription);
  if (!embedding.length) return EMPTY_CONTEXT;

  const jobScopes = await queryVector({
    collection: providerConfig.vector.indexJobScopes || 'ftw-job-scopes',
    vector: embedding,
    topK: 5,
    filter: { status: 'completed' },
  });

  const materials = await queryVector({
    collection: providerConfig.vector.indexMaterials || 'ftw-materials',
    vector: embedding,
    topK: 10,
  });

  const contractors = await queryVector({
    collection: providerConfig.vector.indexContractors || 'ftw-contractors',
    vector: embedding,
    topK: 8,
  });

  return {
    similarScopes: jobScopes,
    materialPricing: materials,
    suggestedContractors: contractors,
    averagePrice: computeAveragePrice(jobScopes),
    typicalTimeframe: computeTypicalTimeframe(jobScopes),
  };
}

async function queryVector(request: VectorQueryRequest): Promise<RetrievedDocument[]> {
  const { apiKey, baseUrl } = providerConfig.vector;
  if (!apiKey || !baseUrl) return [];

  try {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        index: request.collection,
        vector: request.vector,
        topK: request.topK,
        filter: request.filter,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Vector query failed: ${res.status} ${body}`);
    }

    const data = await res.json();
    const matches = data.matches || data.results || [];

    return matches.map((m: any) => ({
      id: m.id,
      title: m.metadata?.title,
      content: m.metadata?.content || m.value || '',
      metadata: m.metadata,
      score: m.score || m.similarity || 0,
    }));
  } catch (error) {
    console.warn('queryVector fallback:', error);
    return [];
  }
}

function computeAveragePrice(scopes: RetrievedDocument[]): number | undefined {
  const prices: number[] = [];
  scopes.forEach((s) => {
    const price = s.metadata?.finalPrice || s.metadata?.price;
    if (typeof price === 'number') prices.push(price);
  });
  if (!prices.length) return undefined;
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  return Math.round(avg);
}

function computeTypicalTimeframe(scopes: RetrievedDocument[]): string | undefined {
  const durations: number[] = [];
  scopes.forEach((s) => {
    const days = s.metadata?.durationDays || s.metadata?.duration;
    if (typeof days === 'number') durations.push(days);
  });
  if (!durations.length) return undefined;
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  if (avg < 1) return '<1 day';
  if (avg < 3) return '1-3 days';
  if (avg < 7) return '3-7 days';
  return `${Math.round(avg)} days`;
}

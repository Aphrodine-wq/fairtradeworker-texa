import { embedText } from '../ai/embeddings';
import { providerConfig, providerSwitches } from '../ai/providers';

export interface ContractorMatch {
  contractorId?: string;
  score: number;
  semanticSimilarity?: number;
  reviewScore?: number;
  responseTime?: number;
  completionRate?: number;
  specialtyMatch?: number;
  availability?: number;
  metadata?: Record<string, any>;
}

interface JobLike {
  title?: string;
  description: string;
  zipCode?: string;
  preferredDate?: string;
}

export async function findBestContractors(job: JobLike): Promise<ContractorMatch[]> {
  if (!providerSwitches.enableMatching || !providerSwitches.enableRag) return [];
  const { apiKey, baseUrl, indexContractors } = providerConfig.vector;
  if (!apiKey || !baseUrl) return [];

  const { embedding } = await embedText(`${job.title || ''} ${job.description}`);
  if (!embedding.length) return [];

  const matches = await queryContractors({
    index: indexContractors || 'ftw-contractors',
    vector: embedding,
    topK: 20,
    filter: { servicesZip: job.zipCode, isActive: true },
    apiKey,
    baseUrl,
  });

  return matches
    .map((m) => {
      const composite = calculateCompositeScore({
        semanticSimilarity: m.score,
        reviewScore: m.metadata?.avgRating,
        responseTime: m.metadata?.avgResponseTime,
        completionRate: m.metadata?.completionRate,
        specialtyMatch: deriveSpecialtyMatch(job.description, m.metadata?.specialty),
        availability: m.metadata?.availabilityScore,
      });
      return { ...m, score: composite };
    })
    .sort((a, b) => b.score - a.score);
}

async function queryContractors(params: {
  index: string;
  vector: number[];
  topK: number;
  filter?: Record<string, any>;
  apiKey: string;
  baseUrl: string;
}): Promise<ContractorMatch[]> {
  try {
    const res = await fetch(params.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.apiKey}`,
      },
      body: JSON.stringify({
        index: params.index,
        vector: params.vector,
        topK: params.topK,
        filter: params.filter,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Vector contractor query failed: ${res.status} ${body}`);
    }

    const data = await res.json();
    const matches = data.matches || data.results || [];

    return matches.map((m: any) => ({
      contractorId: m.id,
      semanticSimilarity: m.score || m.similarity || 0,
      metadata: m.metadata,
      score: m.score || 0,
    }));
  } catch (error) {
    console.warn('queryContractors fallback:', error);
    return [];
  }
}

function calculateCompositeScore(signals: {
  semanticSimilarity?: number;
  reviewScore?: number;
  responseTime?: number;
  completionRate?: number;
  specialtyMatch?: number;
  availability?: number;
}): number {
  const sim = (signals.semanticSimilarity ?? 0) * 0.4;
  const review = normalize(signals.reviewScore, 5) * 0.2;
  const completion = normalize(signals.completionRate, 1) * 0.15;
  const speed = signals.responseTime ? Math.max(0, 1 - signals.responseTime / 3600000) * 0.1 : 0;
  const specialty = (signals.specialtyMatch ?? 0) * 0.1;
  const availability = (signals.availability ?? 0) * 0.05;
  return sim + review + completion + speed + specialty + availability;
}

function normalize(value: number | undefined, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value / max));
}

function deriveSpecialtyMatch(description: string, specialty?: string): number {
  if (!specialty) return 0;
  const desc = description.toLowerCase();
  const spec = specialty.toLowerCase();
  return desc.includes(spec) ? 1 : 0.3;
}

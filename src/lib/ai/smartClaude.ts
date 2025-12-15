/* ========================================
   SMART CLAUDE TIERING - TWO-TIER APPROACH
   Simple jobs = Haiku (cheap)
   Complex jobs = Sonnet (smart)
   ======================================== */

import { classifyJob, detectSpamScore, type JobClassification } from './openSourceRouter';
import { getJobContext, type RAGContext } from './ragContext';
import { providerConfig } from './providers';

// Note: This implementation now supports hosted Claude API calls with
// open-source pre-routing and RAG context. Spark LLM is kept as a fallback.

export interface JobData {
  title?: string;
  description?: string;
  photos?: string[] | File[];
  multiTrade?: boolean;
  isMajorProject?: boolean;
  audioTranscript?: string;
}

export interface ScopeResult {
  scope: string;
  priceLow: number;
  priceHigh: number;
  materials: string[];
  time?: string;
  model?: string;
}

/**
 * Determines if a job is simple enough for Haiku
 */
const isSimpleJob = (job: JobData): boolean => {
  const descLength = job.description?.length || 0;
  const photoCount = job.photos?.length || 0;
  
  return (
    descLength < 200 &&
    !job.multiTrade &&
    !job.isMajorProject &&
    photoCount < 3
  );
};

/**
 * Creates a standard prompt for simple jobs (Haiku)
 */
const createStandardPrompt = (job: JobData): string => {
  return `QUICK SCOPE - CLAUDE HAIKU
Job: ${job.title || 'Untitled Job'}
Details: ${job.description || 'No description provided'}
Photos: ${job.photos?.length || 0}

Respond in exactly this format:
SCOPE: [2 sentences]
PRICE: $XXX-$XXX
MATERIALS: item1, item2, item3
TIME: X days

Guidelines:
- Prices realistic for Texas (labor $50-100/hr, materials at cost+25%)
- Include 3-6 key materials
- Keep scope professional and specific`;
};

/**
 * Creates a detailed prompt for complex jobs (Sonnet)
 */
const createDetailedPrompt = (job: JobData): string => {
  return `DETAILED SCOPE - CLAUDE SONNET
Job: ${job.title || 'Untitled Job'}
Details: ${job.description || 'No description provided'}
Photos: ${job.photos?.length || 0}
Multi-trade: ${job.multiTrade ? 'YES' : 'NO'}
Major project: ${job.isMajorProject ? 'YES' : 'NO'}
${job.audioTranscript ? `Audio transcript: ${job.audioTranscript}` : ''}

Provide comprehensive scope with:
1. Detailed work breakdown
2. Precise price range
3. Complete materials list
4. Timeline with milestones
5. Special considerations

Respond in JSON format:
{
  "scope": "Detailed description of work",
  "priceLow": <number>,
  "priceHigh": <number>,
  "materials": ["item1", "item2", ...],
  "time": "X days with milestones"
}`;
};

/**
 * Calls Claude Haiku for simple jobs
 * Uses Spark LLM with gpt-4o-mini as fallback (cheaper model for simple jobs)
 */
const callClaudeHaiku = async (jobData: JobData, prompt: string): Promise<ScopeResult> => {
  // Prefer hosted Claude
  const hosted = await callClaudeHosted(prompt, 'claude-3-haiku-20240307');
  if (hosted) return parseHaikuResponse(hosted, jobData);

  // Fallback to Spark LLM if available
  if (typeof window !== 'undefined' && (window as any).spark?.llm) {
    const response = await (window as any).spark.llm(prompt, 'gpt-4o-mini', true);
    return parseHaikuResponse(response, jobData);
  }

  throw new Error('AI service not available for Haiku');
};

/**
 * Calls Claude Sonnet for complex jobs
 * Uses Spark LLM with gpt-4o for complex jobs (more capable model)
 */
const callClaudeSonnet = async (jobData: JobData, prompt: string): Promise<ScopeResult> => {
  const hosted = await callClaudeHosted(prompt, 'claude-3-5-sonnet-20241022');
  if (hosted) return parseSonnetResponse(hosted, jobData);

  if (typeof window !== 'undefined' && (window as any).spark?.llm) {
    const response = await (window as any).spark.llm(prompt, 'gpt-4o', true);
    return parseSonnetResponse(response, jobData);
  }

  throw new Error('AI service not available for Sonnet');
};

/**
 * Parses Haiku response (simple format)
 */
const parseHaikuResponse = (text: string, jobData: JobData): ScopeResult => {
  const scopeMatch = text.match(/SCOPE:\s*(.+?)(?=PRICE:|$)/s);
  const priceMatch = text.match(/PRICE:\s*\$(\d+)-?\$?(\d+)?/);
  const materialsMatch = text.match(/MATERIALS:\s*(.+?)(?=TIME:|$)/s);
  const timeMatch = text.match(/TIME:\s*(.+?)(?:\n|$)/);

  return {
    scope: scopeMatch?.[1]?.trim() || 'Standard job scope based on description.',
    priceLow: priceMatch?.[1] ? parseInt(priceMatch[1]) : 100,
    priceHigh: priceMatch?.[2] ? parseInt(priceMatch[2]) : (priceMatch?.[1] ? parseInt(priceMatch[1]) * 1.5 : 200),
    materials: materialsMatch?.[1]?.split(',').map(m => m.trim()).filter(Boolean) || ['Standard materials'],
    time: timeMatch?.[1]?.trim() || '1-2 days',
    model: 'claude-3-haiku-20240307',
  };
};

/**
 * Parses Sonnet response (JSON format)
 */
const parseSonnetResponse = (text: string, jobData: JobData): ScopeResult => {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        scope: parsed.scope || 'Comprehensive project scope.',
        priceLow: parsed.priceLow || 500,
        priceHigh: parsed.priceHigh || 1000,
        materials: Array.isArray(parsed.materials) ? parsed.materials : ['Project materials'],
        time: parsed.time || '5-10 days',
        model: 'claude-3-5-sonnet-20241022',
      };
    }
  } catch (error) {
    console.warn('Failed to parse Sonnet JSON, using fallback:', error);
  }

  // Fallback parsing
  return {
    scope: text.substring(0, 500) || 'Detailed project scope based on requirements.',
    priceLow: 500,
    priceHigh: 2000,
    materials: ['Project-specific materials'],
    time: '5-10 days',
    model: 'claude-3-5-sonnet-20241022',
  };
};

/**
 * Main function to get job scope with smart tiering
 */
export const getJobScope = async (jobData: JobData): Promise<ScopeResult> => {
  const description = jobData.description || '';
  const classification: JobClassification = await classifyJob(description);
  const spamScore = detectSpamScore(description);
  const needsSonnet = classification.requiresSonnet || classification.intent === 'multi_trade' || classification.intent === 'major_project';

  // Build RAG context
  const ragContext: RAGContext = await getJobContext(description);

  // Simple jobs = Haiku if classification says so and not spam-heavy
  if (!needsSonnet && isSimpleJob(jobData)) {
    const prompt = createStandardPromptWithContext(jobData, ragContext, classification);
    return await callClaudeHaiku(jobData, prompt);
  }

  // Complex/Multi jobs = Sonnet
  const prompt = createDetailedPromptWithContext(jobData, ragContext, classification, spamScore);
  return await callClaudeSonnet(jobData, prompt);
};

/**
 * Hosted Claude call using messages API (minimal wrapper).
 */
async function callClaudeHosted(prompt: string, defaultModel: string): Promise<string | null> {
  const model = providerConfig.scoping.model || defaultModel;
  const apiKey = providerConfig.scoping.apiKey;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: providerConfig.scoping.maxTokens || 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Claude hosted error: ${res.status} ${body}`);
    }
    const data = await res.json();
    const content = data.content?.[0]?.text || '';
    return content;
  } catch (error) {
    console.warn('callClaudeHosted fallback:', error);
    return null;
  }
}

const createStandardPromptWithContext = (job: JobData, ctx: RAGContext, classification: JobClassification): string => {
  const similar = ctx.similarScopes.map((s) => `- ${s.title || 'job'}: $${s.metadata?.finalPrice || s.metadata?.price || 'n/a'}`).join('\n');
  const materials = ctx.materialPricing.map((m) => `- ${m.title || m.metadata?.item || 'item'}: $${m.metadata?.price || 'n/a'}`).join('\n');
  const contractors = ctx.suggestedContractors.map((c) => `- ${c.title || c.metadata?.name || 'contractor'} (${c.metadata?.specialty || ''})`).join('\n');

  return `QUICK SCOPE - CLAUDE HAIKU
Job: ${job.title || 'Untitled Job'}
Details: ${job.description || 'No description provided'}
Photos: ${job.photos?.length || 0}
Intent: ${classification.intent}, Complexity: ${classification.complexity}

Context:
Similar jobs:
${similar || 'None'}

Material prices:
${materials || 'None'}

Suggested contractors:
${contractors || 'None'}

Respond in exactly this format:
SCOPE: [2 sentences]
PRICE: $XXX-$XXX
MATERIALS: item1, item2, item3
TIME: X days`;
};

const createDetailedPromptWithContext = (
  job: JobData,
  ctx: RAGContext,
  classification: JobClassification,
  spamScore: number
): string => {
  const similar = ctx.similarScopes.map((s) => `- ${s.title || 'job'}: $${s.metadata?.finalPrice || s.metadata?.price || 'n/a'}, ${s.metadata?.duration || s.metadata?.durationDays || '?'} days`).join('\n');
  const materials = ctx.materialPricing.map((m) => `- ${m.title || m.metadata?.item || 'item'}: $${m.metadata?.price || 'n/a'}`).join('\n');
  const contractors = ctx.suggestedContractors.map((c) => `- ${c.title || c.metadata?.name || 'contractor'} (${c.metadata?.specialty || ''})`).join('\n');

  return `DETAILED SCOPE - CLAUDE SONNET
Job: ${job.title || 'Untitled Job'}
Details: ${job.description || 'No description provided'}
Photos: ${job.photos?.length || 0}
Multi-trade: ${job.multiTrade ? 'YES' : 'NO'}
Major project: ${job.isMajorProject ? 'YES' : 'NO'}
Classification: ${classification.intent} (complexity ${classification.complexity})
Spam score: ${spamScore}

Context:
Similar jobs:
${similar || 'None'}

Material prices:
${materials || 'None'}

Suggested contractors:
${contractors || 'None'}

Provide comprehensive scope with:
1. Detailed work breakdown
2. Precise price range
3. Complete materials list
4. Timeline with milestones
5. Special considerations
6. Note if spam score seems high`;
};

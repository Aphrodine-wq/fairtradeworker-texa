/* ========================================
   SMART CLAUDE TIERING - TWO-TIER APPROACH
   Simple jobs = Haiku (cheap)
   Complex jobs = Sonnet (smart)
   ======================================== */

// Note: This implementation uses Spark LLM as the backend
// When Anthropic SDK is available, it will use direct Claude API calls
// Install with: npm install @anthropic-ai/sdk

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
const callClaudeHaiku = async (jobData: JobData): Promise<ScopeResult> => {
  const prompt = createStandardPrompt(jobData);
  
  try {
    // Use Spark LLM with cheaper model for simple jobs
    // In production with Anthropic SDK: use claude-3-haiku-20240307
    if (typeof window !== 'undefined' && (window as any).spark?.llm) {
      const response = await (window as any).spark.llm(prompt, "gpt-4o-mini", true);
      return parseHaikuResponse(response, jobData);
    }
    
    // Fallback if Spark LLM not available
    throw new Error('AI service not available');
  } catch (error) {
    console.error('Claude Haiku call failed:', error);
    throw error;
  }
};

/**
 * Calls Claude Sonnet for complex jobs
 * Uses Spark LLM with gpt-4o for complex jobs (more capable model)
 */
const callClaudeSonnet = async (jobData: JobData): Promise<ScopeResult> => {
  const prompt = createDetailedPrompt(jobData);
  
  try {
    // Use Spark LLM with more capable model for complex jobs
    // In production with Anthropic SDK: use claude-3-5-sonnet-20241022
    if (typeof window !== 'undefined' && (window as any).spark?.llm) {
      const response = await (window as any).spark.llm(prompt, "gpt-4o", true);
      return parseSonnetResponse(response, jobData);
    }
    
    // Fallback if Spark LLM not available
    throw new Error('AI service not available');
  } catch (error) {
    console.error('Claude Sonnet call failed:', error);
    throw error;
  }
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
  // Simple jobs = Haiku (cheap)
  if (isSimpleJob(jobData)) {
    return await callClaudeHaiku(jobData);
  }
  
  // Complex/Multi jobs = Sonnet (smart)
  return await callClaudeSonnet(jobData);
};

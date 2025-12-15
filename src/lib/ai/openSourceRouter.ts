import { providerConfig, providerSwitches } from './providers';
import { classificationCache } from './cache';

export type JobIntent = 'quick_fix' | 'standard' | 'major_project' | 'multi_trade' | 'inspection' | 'emergency';

export interface JobClassification {
  intent: JobIntent;
  complexity: number; // 0-100
  trades: string[];
  requiresSonnet: boolean;
  spamScore: number; // 0-1
  reasoning?: string;
}

interface HostedLLMRequest {
  prompt: string;
  model: string;
  baseUrl?: string;
  apiKey?: string;
}

const DEFAULT_CLASSIFICATION: JobClassification = {
  intent: 'standard',
  complexity: 50,
  trades: ['general'],
  requiresSonnet: false,
  spamScore: 0,
  reasoning: 'fallback: default classification',
};

export async function classifyJob(description: string): Promise<JobClassification> {
  if (!providerSwitches.enableRouting) return DEFAULT_CLASSIFICATION;

  const cached = classificationCache.get(description);
  if (cached) return cached;

  const prompt = buildClassificationPrompt(description);
  const { model, baseUrl, apiKey } = providerConfig.routing;

  try {
    const raw = await callHostedLLM({ prompt, model, baseUrl, apiKey });
    const parsed = parseClassification(raw, description);
    classificationCache.set(description, parsed);
    return parsed;
  } catch (error) {
    console.warn('classifyJob fallback due to error:', error);
    const fallback = ruleBasedClassification(description);
    classificationCache.set(description, fallback);
    return fallback;
  }
}

export function ruleBasedClassification(description: string): JobClassification {
  const desc = description.toLowerCase();
  const emergency = ['emergency', 'urgent', 'leak', 'flood', 'no power', 'gas'].some((k) => desc.includes(k));
  const multi = ['kitchen', 'bathroom', 'remodel', 'addition'].some((k) => desc.includes(k));
  const short = desc.length < 180;

  if (emergency) {
    return { ...DEFAULT_CLASSIFICATION, intent: 'emergency', complexity: 80, requiresSonnet: true, reasoning: 'rule-based emergency' };
  }
  if (multi) {
    return { ...DEFAULT_CLASSIFICATION, intent: 'multi_trade', complexity: 75, requiresSonnet: true, reasoning: 'rule-based multi-trade' };
  }
  if (short) {
    return { ...DEFAULT_CLASSIFICATION, intent: 'quick_fix', complexity: 30, requiresSonnet: false, reasoning: 'rule-based quick fix' };
  }
  return DEFAULT_CLASSIFICATION;
}

export function detectSpamScore(text: string): number {
  const patterns = [
    /(http|https):\/\/\S+/gi,
    /\bfree\b/gi,
    /\bcall\s+now\b/gi,
    /(.)\1{4,}/g,
  ];
  let score = 0;
  patterns.forEach((p) => {
    if (p.test(text)) score += 0.2;
  });
  const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1);
  if (capsRatio > 0.5 && text.length > 20) score += 0.2;
  return Math.min(1, score);
}

export function detectLanguage(text: string): 'en' | 'other' {
  const hasLatin = /[a-zA-Z]/.test(text);
  const hasCyrillic = /[А-Яа-яЁё]/.test(text);
  if (hasLatin && !hasCyrillic) return 'en';
  return 'other';
}

function buildClassificationPrompt(description: string): string {
  return `Classify this home service job. Return JSON only.

Job: "${description.slice(0, 800)}"

Classify into: quick_fix, standard, major_project, multi_trade, inspection, emergency.
Return:
{
  "intent": "quick_fix|standard|major_project|multi_trade|inspection|emergency",
  "complexity": 0-100,
  "trades": ["plumbing", "electrical", ...],
  "requiresSonnet": true|false,
  "reasoning": "one short sentence"
}`;
}

async function callHostedLLM({ prompt, model, baseUrl, apiKey }: HostedLLMRequest): Promise<string> {
  const url = baseUrl || 'https://api.groq.com/openai/v1/chat/completions';
  if (!apiKey) throw new Error('Routing API key missing');

  const body = {
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    max_tokens: 200,
    stream: false,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Hosted LLM error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const message = data.choices?.[0]?.message?.content || '';
  return message;
}

function parseClassification(raw: string, original: string): JobClassification {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return ruleBasedClassification(original);

  try {
    const json = JSON.parse(match[0]);
    const intent = normalizeIntent(json.intent);
    const complexity = clampNumber(json.complexity ?? 50, 0, 100);
    const trades = Array.isArray(json.trades) ? json.trades : ['general'];
    const requiresSonnet = Boolean(json.requiresSonnet) || intent === 'emergency' || complexity > 70 || trades.length > 1;
    const spamScore = detectSpamScore(original);

    return {
      intent,
      complexity,
      trades,
      requiresSonnet,
      spamScore,
      reasoning: json.reasoning || 'parsed classification',
    };
  } catch (error) {
    console.warn('parseClassification fallback:', error);
    return ruleBasedClassification(original);
  }
}

function normalizeIntent(value: string | undefined): JobIntent {
  const intents: JobIntent[] = ['quick_fix', 'standard', 'major_project', 'multi_trade', 'inspection', 'emergency'];
  const normalized = value?.toLowerCase().replace(/[^a-z_]/g, '') as JobIntent;
  return intents.includes(normalized) ? normalized : 'standard';
}

function clampNumber(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
}

import { providerConfig, providerSwitches } from '../ai/providers';

export interface LeadScore {
  score: number; // 0-100
  likelihood: 'hot' | 'warm' | 'cold';
  reasoning: string;
  suggestedAction: string;
  optimalContactTime?: string;
}

export interface LeadSignals {
  responseTimeMs?: number;
  messageCount?: number;
  viewedEstimate?: boolean;
  competitorMentions?: string[];
  urgencyKeywords?: string[];
  budgetSignals?: string[];
  historicalConversion?: number;
}

export async function scoreLeadWithContext(signals: LeadSignals): Promise<LeadScore> {
  if (!providerSwitches.enableBackground) return fallbackScore(signals);
  const { model, apiKey, baseUrl } = providerConfig.background;
  if (!apiKey) return fallbackScore(signals);

  const prompt = buildLeadPrompt(signals);

  try {
    const response = await callBackgroundLLM({ prompt, model, apiKey, baseUrl });
    const parsed = parseLeadScore(response);
    return parsed;
  } catch (error) {
    console.warn('scoreLeadWithContext fallback:', error);
    return fallbackScore(signals);
  }
}

function buildLeadPrompt(signals: LeadSignals): string {
  return `Analyze this lead for a home services contractor. Return JSON only.
Signals:
- Response time (ms): ${signals.responseTimeMs ?? 'n/a'}
- Messages exchanged: ${signals.messageCount ?? 0}
- Viewed estimate: ${Boolean(signals.viewedEstimate)}
- Mentioned competitors: ${(signals.competitorMentions || []).join(', ') || 'none'}
- Urgency indicators: ${(signals.urgencyKeywords || []).join(', ') || 'none'}
- Budget indicators: ${(signals.budgetSignals || []).join(', ') || 'none'}
- Contractor historical close rate: ${signals.historicalConversion ?? 'n/a'}%

Return JSON:
{"score":0-100,"likelihood":"hot|warm|cold","reasoning":"...","suggestedAction":"...","optimalContactTime":"..."}`;
}

function parseLeadScore(text: string): LeadScore {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return fallbackScore({});
  try {
    const json = JSON.parse(match[0]);
    const score = clamp(json.score ?? 50, 0, 100);
    const likelihood = (json.likelihood || 'warm') as LeadScore['likelihood'];
    return {
      score,
      likelihood: ['hot', 'warm', 'cold'].includes(likelihood) ? likelihood : 'warm',
      reasoning: json.reasoning || 'No reasoning provided',
      suggestedAction: json.suggestedAction || 'Follow up within 24h',
      optimalContactTime: json.optimalContactTime,
    };
  } catch (error) {
    console.warn('parseLeadScore fallback:', error);
    return fallbackScore({});
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
}

function fallbackScore(signals: LeadSignals): LeadScore {
  const baseline = 60;
  const warmed = signals.responseTimeMs && signals.responseTimeMs < 2000 ? baseline + 10 : baseline;
  return {
    score: clamp(warmed, 0, 100),
    likelihood: warmed >= 75 ? 'hot' : warmed >= 55 ? 'warm' : 'cold',
    reasoning: 'Heuristic fallback score',
    suggestedAction: 'Respond within 24h with a tailored note',
  };
}

async function callBackgroundLLM(params: { prompt: string; model: string; apiKey: string; baseUrl?: string }): Promise<string> {
  const url =
    params.baseUrl ||
    (providerConfig.background.provider === 'fireworks'
      ? 'https://api.fireworks.ai/inference/v1/chat/completions'
      : 'https://api.together.xyz/v1/chat/completions');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      messages: [{ role: 'user', content: params.prompt }],
      max_tokens: 300,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Background LLM error: ${res.status} ${body}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

import { providerConfig, providerSwitches } from '../ai/providers';

export interface Message {
  id?: string;
  content: string;
  sender?: 'customer' | 'contractor' | 'system';
  timestamp?: number;
}

export interface ConversationAnalysis {
  overallSentiment: 'positive' | 'neutral' | 'negative';
  trend: 'improving' | 'declining' | 'stable';
  warningFlags: string[];
  keyMoments: string[];
  suggestedResponse?: string;
}

export async function analyzeConversation(messages: Message[]): Promise<ConversationAnalysis> {
  if (!providerSwitches.enableBackground) return fallbackAnalysis(messages);
  const { model, apiKey, baseUrl } = providerConfig.background;
  if (!apiKey) return fallbackAnalysis(messages);

  const prompt = buildSentimentPrompt(messages);

  try {
    const response = await callBackgroundLLM({ prompt, model, apiKey, baseUrl });
    return parseConversationAnalysis(response) || fallbackAnalysis(messages);
  } catch (error) {
    console.warn('analyzeConversation fallback:', error);
    return fallbackAnalysis(messages);
  }
}

function buildSentimentPrompt(messages: Message[]): string {
  const transcript = messages
    .slice(-15)
    .map((m) => `${m.sender || 'unknown'}: ${m.content}`)
    .join('\n');

  return `Analyze this conversation and summarize sentiment. Return JSON only.

Messages:
${transcript}

Return JSON:
{
  "overallSentiment": "positive|neutral|negative",
  "trend": "improving|declining|stable",
  "warningFlags": ["..."],
  "keyMoments": ["..."],
  "suggestedResponse": "short suggested message"
}`;
}

function parseConversationAnalysis(text: string): ConversationAnalysis | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const json = JSON.parse(match[0]);
    const overallSentiment = normalizeSentiment(json.overallSentiment);
    const trend = normalizeTrend(json.trend);
    return {
      overallSentiment,
      trend,
      warningFlags: Array.isArray(json.warningFlags) ? json.warningFlags : [],
      keyMoments: Array.isArray(json.keyMoments) ? json.keyMoments : [],
      suggestedResponse: json.suggestedResponse,
    };
  } catch (error) {
    console.warn('parseConversationAnalysis error:', error);
    return null;
  }
}

function normalizeSentiment(val: string): ConversationAnalysis['overallSentiment'] {
  if (val === 'positive' || val === 'negative') return val;
  return 'neutral';
}

function normalizeTrend(val: string): ConversationAnalysis['trend'] {
  if (val === 'improving' || val === 'declining') return val;
  return 'stable';
}

function fallbackAnalysis(messages: Message[]): ConversationAnalysis {
  return {
    overallSentiment: 'neutral',
    trend: 'stable',
    warningFlags: [],
    keyMoments: [],
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
      max_tokens: 250,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Background LLM error: ${res.status} ${body}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

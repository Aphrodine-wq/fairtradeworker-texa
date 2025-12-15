import { analyzeConversation, type Message } from '../crm/sentimentAnalysis';
import { providerConfig, providerSwitches } from '../ai/providers';

export interface ConversationContext {
  jobType?: string;
  lastMessage?: string;
  daysSinceContact?: number;
  quoteGiven?: boolean;
  quoteAmount?: number;
  messages: Message[];
}

export interface FollowUpMessage {
  content: string;
  scheduledFor?: string;
  channel?: 'email' | 'sms' | 'in_app';
}

export async function generateFollowUp(customer: { firstName?: string }, context: ConversationContext): Promise<FollowUpMessage> {
  const analysis = await analyzeConversation(context.messages || []);

  if (!providerSwitches.enableBackground || !providerConfig.background.apiKey) {
    return fallbackFollowUp(customer, context, analysis);
  }

  const prompt = buildFollowUpPrompt(customer, context, analysis);

  try {
    const draft = await callBackgroundLLM({
      prompt,
      model: providerConfig.background.model,
      apiKey: providerConfig.background.apiKey as string,
      baseUrl: providerConfig.background.baseUrl,
    });

    return {
      content: draft || fallbackFollowUp(customer, context, analysis).content,
      scheduledFor: calculateOptimalTime(context),
      channel: determineChannel(),
    };
  } catch (error) {
    console.warn('generateFollowUp fallback:', error);
    return fallbackFollowUp(customer, context, analysis);
  }
}

function buildFollowUpPrompt(customer: { firstName?: string }, context: ConversationContext, analysis: any): string {
  return `Write a concise follow-up message for a contractor to send to a potential customer.

Customer: ${customer.firstName || 'there'}
Job type: ${context.jobType || 'general'}
Last message: ${context.lastMessage || 'N/A'}
Days since contact: ${context.daysSinceContact ?? 'N/A'}
Sentiment trend: ${analysis.trend}
Overall sentiment: ${analysis.overallSentiment}
Quote given: ${context.quoteGiven ? `$${context.quoteAmount ?? 'n/a'}` : 'not yet'}
Main concern: ${(analysis.warningFlags || []).join(', ') || 'unknown'}

Rules:
- Be warm and specific.
- Reference something from the conversation.
- If price/competitor mentioned, address subtly.
- Keep under 100 words.
- Human tone, no emoji.

Return only the message text.`;
}

function fallbackFollowUp(customer: { firstName?: string }, context: ConversationContext, analysis: any): FollowUpMessage {
  const name = customer.firstName ? ` ${customer.firstName}` : '';
  const sentimentNote = analysis.overallSentiment === 'negative' ? ' I want to make sure we address any concerns.' : '';
  return {
    content: `Hi${name}, following up on your ${context.jobType || 'project'}. Happy to answer questions or adjust the estimate.${sentimentNote}`,
    scheduledFor: calculateOptimalTime(context),
    channel: determineChannel(),
  };
}

function calculateOptimalTime(context: ConversationContext): string {
  if ((context.daysSinceContact || 0) > 5) return 'tomorrow 9am local';
  return 'today 5pm local';
}

function determineChannel(): FollowUpMessage['channel'] {
  return 'email';
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
      max_tokens: 200,
      temperature: 0.35,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Background LLM error: ${res.status} ${body}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

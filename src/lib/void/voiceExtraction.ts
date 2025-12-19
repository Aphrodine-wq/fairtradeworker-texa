import { providerConfig } from '@/lib/ai/providers'
import type { ExtractedEntities } from './types'

interface ClaudeExtractionResponse {
  name?: { value: string; confidence: number; alternatives?: string[] }
  phone?: { value: string; confidence: number; normalized?: string; alternatives?: string[] }
  email?: { value: string; confidence: number; alternatives?: string[] }
  project?: { value: string; confidence: number; alternatives?: string[] }
  budget?: { value: number | null; confidence: number; range?: [number, number]; alternatives?: string[] }
  urgency?: { value: 'low' | 'medium' | 'high'; confidence: number; alternatives?: string[] }
}

/**
 * Extract entities from voice transcript using Claude API
 */
export async function extractVoiceEntities(
  transcript: string,
  language: string = 'en-US'
): Promise<ExtractedEntities> {
  const prompt = `Extract structured lead data from transcript with confidence scores.

TRANSCRIPT: "${transcript}"
LANGUAGE: ${language}

OUTPUT JSON (strict, no markdown, valid JSON only):
{
  "name": { "value": "string", "confidence": 0.0-1.0, "alternatives": [] },
  "phone": { "value": "string", "confidence": 0.0-1.0, "normalized": "+1234567890", "alternatives": [] },
  "email": { "value": "string", "confidence": 0.0-1.0, "alternatives": [] },
  "project": { "value": "string", "confidence": 0.0-1.0, "alternatives": [] },
  "budget": { "value": number|null, "confidence": 0.0-1.0, "range": [min, max], "alternatives": [] },
  "urgency": { "value": "low|medium|high", "confidence": 0.0-1.0, "alternatives": [] }
}

Rules:
- If a field is not mentioned, set value to null and confidence to 0
- Normalize phone numbers to E.164 format (+1234567890)
- Extract budget as number, include range if mentioned (e.g., "$15k-$20k" → value: 17500, range: [15000, 20000])
- Urgency: infer from words like "urgent", "asap", "whenever" → low/medium/high
- Confidence: 0.9+ if explicit, 0.7-0.9 if inferred, <0.7 if uncertain
- Provide alternatives for low-confidence fields (<0.85)`

  try {
    // Use Claude API via scoping provider config
    const provider = providerConfig.scoping
    if (!provider || !provider.apiKey) {
      throw new Error('Claude API not configured')
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: provider.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`)
    }

    const data = await response.json()
    const responseText = data.content[0]?.text || ''

    // Parse JSON response
    let parsed: ClaudeExtractionResponse
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/)
      const jsonString = jsonMatch ? jsonMatch[1] : responseText
      parsed = JSON.parse(jsonString.trim())
    } catch (e) {
      // If parsing fails, try to extract JSON object directly
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Failed to parse Claude response as JSON')
      }
    }

    // Convert to ExtractedEntities format
    const entities: ExtractedEntities = {}

    if (parsed.name) {
      entities.name = {
        value: parsed.name.value || null,
        confidence: parsed.name.confidence || 0,
        alternatives: parsed.name.alternatives || [],
      }
    }

    if (parsed.phone) {
      entities.phone = {
        value: parsed.phone.value || null,
        confidence: parsed.phone.confidence || 0,
        normalized: parsed.phone.normalized || undefined,
        alternatives: parsed.phone.alternatives || [],
      }
    }

    if (parsed.email) {
      entities.email = {
        value: parsed.email.value || null,
        confidence: parsed.email.confidence || 0,
        alternatives: parsed.email.alternatives || [],
      }
    }

    if (parsed.project) {
      entities.project = {
        value: parsed.project.value || null,
        confidence: parsed.project.confidence || 0,
        alternatives: parsed.project.alternatives || [],
      }
    }

    if (parsed.budget) {
      entities.budget = {
        value: parsed.budget.value,
        confidence: parsed.budget.confidence || 0,
        range: parsed.budget.range,
        alternatives: parsed.budget.alternatives || [],
      }
    }

    if (parsed.urgency) {
      entities.urgency = {
        value: parsed.urgency.value || null,
        confidence: parsed.urgency.confidence || 0,
        alternatives: parsed.urgency.alternatives || [],
      }
    }

    return entities
  } catch (error) {
    console.error('Entity extraction error:', error)
    // Return empty entities on error
    return {}
  }
}

/**
 * Normalize phone number to E.164 format
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // If starts with +, return as is (assuming already E.164)
  if (cleaned.startsWith('+')) {
    return cleaned
  }
  
  // If starts with 1 and has 11 digits, add +
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return `+${cleaned}`
  }
  
  // If has 10 digits, assume US number and add +1
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  }
  
  // Return original if can't normalize
  return phone
}

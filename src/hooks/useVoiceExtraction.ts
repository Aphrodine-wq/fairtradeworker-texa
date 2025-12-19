import { useState, useCallback } from 'react'
import { extractVoiceEntities } from '@/lib/void/voiceExtraction'
import type { ExtractedEntities } from '@/lib/void/types'

export function useVoiceExtraction() {
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const extractEntities = useCallback(async (
    transcript: string,
    language: string = 'en-US'
  ): Promise<ExtractedEntities> => {
    setIsExtracting(true)
    setError(null)

    try {
      const entities = await extractVoiceEntities(transcript, language)
      setIsExtracting(false)
      return entities
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Extraction failed'
      setError(errorMessage)
      setIsExtracting(false)
      return {}
    }
  }, [])

  return {
    extractEntities,
    isExtracting,
    error,
  }
}

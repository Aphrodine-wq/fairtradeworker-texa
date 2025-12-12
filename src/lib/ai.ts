export async function fakeAIScope(file: File): Promise<{
  scope: string
  priceLow: number
  priceHigh: number
  materials: string[]
  confidenceScore: number
}> {
  try {
    const fileContent = await file.text()
    
    const promptText = `You are an expert home services estimator analyzing jobs in Texas. Based on the job information below, provide a detailed scope, realistic price range, and materials list.

Job Information:
${fileContent}

Return a JSON object with this exact structure:
{
  "scope": "Clear 1-2 sentence description of work to be done",
  "priceLow": <number>,
  "priceHigh": <number>,
  "materials": ["material1", "material2", "material3"],
  "confidenceScore": <number 1-100>
}

Guidelines:
- Prices realistic for Texas (labor $50-100/hr, materials at cost+25%)
- Include 3-6 key materials
- Confidence score: 90+ if detailed info, 60-89 if some ambiguity, <60 if very unclear
- Keep scope professional and specific`

    const response = await window.spark.llm(promptText, "gpt-4o-mini", true)
    const parsed = JSON.parse(response)
    
    if (!parsed.scope || typeof parsed.priceLow !== 'number' || typeof parsed.priceHigh !== 'number' || !Array.isArray(parsed.materials)) {
      throw new Error('Invalid AI response format')
    }
    
    return {
      scope: parsed.scope,
      priceLow: Math.round(parsed.priceLow),
      priceHigh: Math.round(parsed.priceHigh),
      materials: parsed.materials.slice(0, 6),
      confidenceScore: parsed.confidenceScore || 75
    }
  } catch (error) {
    console.error('AI scope generation failed, using fallback:', error)
    
    const fallbackScopes = [
      {
        scope: "Replace leaking kitchen faucet cartridge, repair supply line connections, and test for proper water flow and sealing.",
        priceLow: 120,
        priceHigh: 180,
        materials: ["Moen cartridge", "Basin wrench", "Plumber's grease", "Teflon tape", "Supply lines"],
        confidenceScore: 85
      },
      {
        scope: "Install new ceiling fan with light kit, upgraded wall switch with dimmer, and ensure proper electrical connections.",
        priceLow: 200,
        priceHigh: 300,
        materials: ["Ceiling fan mounting bracket", "Wire nuts", "Wall dimmer switch", "Light kit"],
        confidenceScore: 90
      },
      {
        scope: "Repair drywall hole, apply joint compound, sand smooth, prime, and repaint to match existing wall color.",
        priceLow: 150,
        priceHigh: 250,
        materials: ["Drywall patch", "Joint compound", "Primer", "Paint", "Sandpaper"],
        confidenceScore: 88
      },
      {
        scope: "Replace broken garage door torsion spring, balance door, and perform complete safety inspection of all components.",
        priceLow: 175,
        priceHigh: 275,
        materials: ["Torsion spring", "Winding bars", "Safety cables", "Lubricant"],
        confidenceScore: 92
      },
      {
        scope: "Install new 50-gallon water heater, connect supply and drain lines, test pressure relief valve, and ensure code compliance.",
        priceLow: 800,
        priceHigh: 1200,
        materials: ["50-gal water heater", "Flex connectors", "PRV valve", "Drain pan", "Pipe fittings"],
        confidenceScore: 87
      }
    ]
    
    return fallbackScopes[Math.floor(Math.random() * fallbackScopes.length)]
  }
}

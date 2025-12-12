export async function fakeAIScope(file: File): Promise<{
  scope: string
  priceLow: number
  priceHigh: number
  materials: string[]
}> {
  try {
    const fileContent = await file.text()
    
    const promptText = `You are an expert home services estimator. Analyze this job description and provide a detailed scope of work, price range, and materials list.

Job Information:
${fileContent}

Provide your response as a JSON object with the following structure:
{
  "scope": "Detailed 1-2 sentence description of the work to be done",
  "priceLow": number (minimum estimated cost),
  "priceHigh": number (maximum estimated cost),
  "materials": ["material1", "material2", "material3"]
}

Guidelines:
- Price ranges should be realistic for Texas home services
- Include 3-5 key materials
- Keep scope clear and professional
- Consider labor, materials, and complexity`

    const response = await window.spark.llm(promptText, "gpt-4o-mini", true)
    const result = JSON.parse(response)
    
    if (!result.scope || typeof result.priceLow !== 'number' || typeof result.priceHigh !== 'number' || !Array.isArray(result.materials)) {
      throw new Error('Invalid AI response format')
    }
    
    return {
      scope: result.scope,
      priceLow: Math.round(result.priceLow),
      priceHigh: Math.round(result.priceHigh),
      materials: result.materials
    }
  } catch (error) {
    console.error('AI scope generation failed, using fallback:', error)
    
    const fallbackScopes = [
      {
        scope: "Replace leaking kitchen faucet cartridge and repair supply line connections.",
        priceLow: 120,
        priceHigh: 180,
        materials: ["Moen cartridge", "Basin wrench", "Plumber's grease", "Teflon tape"]
      },
      {
        scope: "Install new ceiling fan with light kit and upgraded wall switch.",
        priceLow: 200,
        priceHigh: 300,
        materials: ["Ceiling fan mounting bracket", "Wire nuts", "Wall dimmer switch"]
      },
      {
        scope: "Repair drywall hole and repaint bedroom wall to match existing color.",
        priceLow: 150,
        priceHigh: 250,
        materials: ["Drywall patch", "Joint compound", "Primer", "Paint", "Sandpaper"]
      },
      {
        scope: "Replace broken garage door spring and perform safety inspection.",
        priceLow: 175,
        priceHigh: 275,
        materials: ["Torsion spring", "Winding bars", "Safety cables"]
      }
    ]
    
    return fallbackScopes[Math.floor(Math.random() * fallbackScopes.length)]
  }
}

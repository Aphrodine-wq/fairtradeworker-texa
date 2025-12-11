export async function fakeAIScope(file: File): Promise<{
  scope: string
  priceLow: number
  priceHigh: number
  materials: string[]
}> {
  await new Promise(r => setTimeout(r, 2000))
  
  const scopes = [
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
  
  return scopes[Math.floor(Math.random() * scopes.length)]
}

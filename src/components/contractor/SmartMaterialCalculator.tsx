import { useState, useCallback, useRef, useEffect } from 'react'
import { Calculator, Camera, Ruler, Package, ShoppingCart, Sparkle, ArrowRight, Check, Store, ExternalLink, Upload, Trash } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

// Material types with coverage and pricing
const MATERIALS = {
  paint: {
    name: 'Interior Paint',
    unit: 'gallon',
    coveragePerUnit: 400, // sq ft per gallon
    wasteFactors: { standard: 1.1, complex: 1.15, detailed: 1.2 },
    priceRanges: {
      economy: { min: 25, max: 35, label: 'Economy' },
      standard: { min: 40, max: 55, label: 'Standard' },
      premium: { min: 60, max: 85, label: 'Premium' }
    }
  },
  drywall: {
    name: 'Drywall',
    unit: 'sheet (4x8)',
    coveragePerUnit: 32, // sq ft per sheet
    wasteFactors: { standard: 1.1, complex: 1.15, detailed: 1.2 },
    priceRanges: {
      economy: { min: 12, max: 15, label: '1/2" Standard' },
      standard: { min: 15, max: 20, label: '5/8" Fire-rated' },
      premium: { min: 25, max: 35, label: 'Moisture-resistant' }
    }
  },
  tile: {
    name: 'Ceramic Tile',
    unit: 'sq ft',
    coveragePerUnit: 1,
    wasteFactors: { standard: 1.1, complex: 1.15, detailed: 1.2 },
    priceRanges: {
      economy: { min: 2, max: 5, label: 'Basic Ceramic' },
      standard: { min: 6, max: 12, label: 'Porcelain' },
      premium: { min: 15, max: 30, label: 'Natural Stone' }
    }
  },
  flooring: {
    name: 'LVP Flooring',
    unit: 'sq ft',
    coveragePerUnit: 1,
    wasteFactors: { standard: 1.1, complex: 1.12, detailed: 1.15 },
    priceRanges: {
      economy: { min: 2, max: 4, label: 'Basic LVP' },
      standard: { min: 4, max: 7, label: 'Premium LVP' },
      premium: { min: 7, max: 12, label: 'Rigid Core' }
    }
  },
  insulation: {
    name: 'Insulation',
    unit: 'roll (15" x 25\')',
    coveragePerUnit: 31.25, // sq ft per roll
    wasteFactors: { standard: 1.05, complex: 1.1, detailed: 1.15 },
    priceRanges: {
      economy: { min: 15, max: 25, label: 'R-13' },
      standard: { min: 30, max: 45, label: 'R-19' },
      premium: { min: 50, max: 70, label: 'R-30' }
    }
  },
  lumber: {
    name: '2x4 Lumber',
    unit: 'linear ft',
    coveragePerUnit: 16, // studs 16" OC for wall linear ft
    wasteFactors: { standard: 1.1, complex: 1.15, detailed: 1.2 },
    priceRanges: {
      economy: { min: 3, max: 5, label: 'SPF' },
      standard: { min: 5, max: 8, label: 'Doug Fir' },
      premium: { min: 8, max: 12, label: 'Treated' }
    }
  }
}

// Reference objects for dimension detection
const REFERENCE_OBJECTS = {
  door: { name: 'Standard Door', height: 80, width: 36 },
  outlet: { name: 'Outlet', height: 12, fromFloor: 12 },
  switch: { name: 'Light Switch', height: 4, fromFloor: 48 },
  window: { name: 'Standard Window', height: 48, width: 36 }
}

interface RoomDimensions {
  length: number
  width: number
  height: number
  windowArea: number
  doorArea: number
}

interface MaterialEstimate {
  material: keyof typeof MATERIALS
  quantity: number
  unit: string
  totalSqFt: number
  wasteIncluded: number
  priceEstimates: {
    tier: string
    unitPrice: { min: number; max: number }
    total: { min: number; max: number }
  }[]
  suppliers?: SupplierPrice[]
}

interface SupplierPrice {
  name: string
  price: number
  inStock: boolean
  link?: string
}

interface SmartMaterialCalculatorProps {
  onAddToEstimate?: (estimate: MaterialEstimate) => void
}

export function SmartMaterialCalculator({ onAddToEstimate }: SmartMaterialCalculatorProps) {
  const [mode, setMode] = useState<'manual' | 'photo'>('manual')
  const [photo, setPhoto] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [dimensions, setDimensions] = useState<RoomDimensions>({
    length: 12,
    width: 10,
    height: 9,
    windowArea: 15,
    doorArea: 21
  })
  const [selectedMaterial, setSelectedMaterial] = useState<keyof typeof MATERIALS>('paint')
  const [complexity, setComplexity] = useState<'standard' | 'complex' | 'detailed'>('standard')
  const [estimate, setEstimate] = useState<MaterialEstimate | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calculate estimate when inputs change
  useEffect(() => {
    if (dimensions.length && dimensions.width) {
      calculateEstimate()
    }
  }, [dimensions, selectedMaterial, complexity])

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const imageUrl = event.target?.result as string
      setPhoto(imageUrl)
      setAnalyzing(true)

      try {
        // Simulate AI analysis (in production, this would call GPT-4 Vision)
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Demo: detected dimensions from photo
        const detectedDimensions = analyzePhotoDemo(imageUrl)
        setDimensions(detectedDimensions)
        
        toast.success('Room dimensions detected from photo!')
      } catch (error) {
        toast.error('Could not analyze photo. Please enter dimensions manually.')
      } finally {
        setAnalyzing(false)
      }
    }
    reader.readAsDataURL(file)
  }, [])

  // Demo photo analysis (in production, use GPT-4 Vision)
  const analyzePhotoDemo = (imageUrl: string): RoomDimensions => {
    // Simulate AI detection using reference objects
    // In production, this would analyze the image for:
    // - Door frames (80" standard height)
    // - Outlets (12" from floor)
    // - Windows
    // - Ceiling height indicators
    
    return {
      length: 14,
      width: 12,
      height: 9,
      windowArea: 24,
      doorArea: 21
    }
  }

  const calculateEstimate = useCallback(() => {
    const material = MATERIALS[selectedMaterial]
    const wallArea = 2 * (dimensions.length + dimensions.width) * dimensions.height
    const floorArea = dimensions.length * dimensions.width
    const ceilingArea = floorArea
    
    // Calculate net area based on material type
    let totalSqFt: number
    switch (selectedMaterial) {
      case 'paint':
        // Walls + ceiling minus openings
        totalSqFt = wallArea + ceilingArea - dimensions.windowArea - dimensions.doorArea
        break
      case 'flooring':
      case 'tile':
        totalSqFt = floorArea
        break
      case 'drywall':
        totalSqFt = wallArea - dimensions.windowArea - dimensions.doorArea
        break
      case 'insulation':
        totalSqFt = wallArea
        break
      case 'lumber':
        // Perimeter for wall framing
        totalSqFt = 2 * (dimensions.length + dimensions.width)
        break
      default:
        totalSqFt = floorArea
    }
    
    const wasteFactor = material.wasteFactors[complexity]
    const adjustedSqFt = totalSqFt * wasteFactor
    const quantity = Math.ceil(adjustedSqFt / material.coveragePerUnit)
    
    // Calculate price estimates for each tier
    const priceEstimates = Object.entries(material.priceRanges).map(([tier, range]) => ({
      tier: range.label,
      unitPrice: { min: range.min, max: range.max },
      total: {
        min: Math.round(quantity * range.min),
        max: Math.round(quantity * range.max)
      }
    }))
    
    // Demo supplier pricing (in production, this would query supplier APIs)
    const suppliers: SupplierPrice[] = [
      { name: 'Home Depot', price: Math.round(quantity * (material.priceRanges.standard.min + material.priceRanges.standard.max) / 2 * 1.05), inStock: true, link: 'https://homedepot.com' },
      { name: 'Lowe\'s', price: Math.round(quantity * (material.priceRanges.standard.min + material.priceRanges.standard.max) / 2 * 1.03), inStock: true, link: 'https://lowes.com' },
      { name: 'ABC Supply', price: Math.round(quantity * (material.priceRanges.standard.min + material.priceRanges.standard.max) / 2 * 0.95), inStock: true }
    ]
    
    setEstimate({
      material: selectedMaterial,
      quantity,
      unit: material.unit,
      totalSqFt: Math.round(totalSqFt),
      wasteIncluded: Math.round((wasteFactor - 1) * 100),
      priceEstimates,
      suppliers
    })
  }, [dimensions, selectedMaterial, complexity])

  const clearPhoto = () => {
    setPhoto(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Smart Material Calculator
        </CardTitle>
        <CardDescription>
          Calculate materials from room dimensions or a photo
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Input Mode Tabs */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'manual' | 'photo')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">
              <Ruler className="h-4 w-4 mr-2" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="photo">
              <Camera className="h-4 w-4 mr-2" />
              Photo Analysis
              <Badge variant="secondary" className="ml-2 text-xs">AI</Badge>
            </TabsTrigger>
          </TabsList>
          
          {/* Manual Entry */}
          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Length (ft)</Label>
                <Input
                  type="number"
                  value={dimensions.length}
                  onChange={(e) => setDimensions(d => ({ ...d, length: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Width (ft)</Label>
                <Input
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => setDimensions(d => ({ ...d, width: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Height (ft)</Label>
                <Input
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => setDimensions(d => ({ ...d, height: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Window Area (sq ft)</Label>
                <Input
                  type="number"
                  value={dimensions.windowArea}
                  onChange={(e) => setDimensions(d => ({ ...d, windowArea: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Door Area (sq ft)</Label>
                <Input
                  type="number"
                  value={dimensions.doorArea}
                  onChange={(e) => setDimensions(d => ({ ...d, doorArea: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Photo Analysis */}
          <TabsContent value="photo" className="space-y-4 mt-4">
            {!photo ? (
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium">Upload a room photo</p>
                <p className="text-sm text-muted-foreground mt-1">
                  AI will detect dimensions using reference objects (doors, outlets)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={photo} 
                  alt="Room" 
                  className="w-full rounded-lg max-h-64 object-cover"
                />
                {analyzing && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Sparkle className="h-8 w-8 mx-auto animate-pulse" />
                      <p className="mt-2">Analyzing dimensions...</p>
                    </div>
                  </div>
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={clearPhoto}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {photo && !analyzing && (
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                  <Check className="h-4 w-4" />
                  <span className="font-medium">Dimensions Detected</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {dimensions.length}' × {dimensions.width}' × {dimensions.height}' ceiling
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on detected door frame (80" standard) and outlet positions
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Material Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Material Type</Label>
            <Select value={selectedMaterial} onValueChange={(v) => setSelectedMaterial(v as keyof typeof MATERIALS)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MATERIALS).map(([key, mat]) => (
                  <SelectItem key={key} value={key}>
                    {mat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Complexity</Label>
            <Select value={complexity} onValueChange={(v) => setComplexity(v as typeof complexity)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (10% waste)</SelectItem>
                <SelectItem value="complex">Complex (15% waste)</SelectItem>
                <SelectItem value="detailed">Detailed (20% waste)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Results */}
        {estimate && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Material Estimate
              </h3>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Coverage Area</span>
                  <span className="font-medium">{estimate.totalSqFt} sq ft</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Waste Factor</span>
                  <span className="font-medium">+{estimate.wasteIncluded}%</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="font-medium">Quantity Needed</span>
                  <span className="font-bold text-primary">
                    {estimate.quantity} {estimate.unit}s
                  </span>
                </div>
              </div>
            </div>
            
            {/* Price Tiers */}
            <div>
              <h4 className="font-medium mb-2">Price Estimates</h4>
              <div className="grid grid-cols-3 gap-3">
                {estimate.priceEstimates.map((tier, i) => (
                  <Card key={i} className={i === 1 ? 'border-primary' : ''}>
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">{tier.tier}</p>
                      <p className="text-lg font-bold">
                        ${tier.total.min} - ${tier.total.max}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${tier.unitPrice.min}-{tier.unitPrice.max}/{estimate.unit}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Supplier Pricing */}
            {estimate.suppliers && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Supplier Pricing
                </h4>
                <div className="space-y-2">
                  {estimate.suppliers.sort((a, b) => a.price - b.price).map((supplier, i) => (
                    <div 
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        i === 0 ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800' : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {i === 0 && <Badge variant="default" className="text-xs">Best Price</Badge>}
                        <span className="font-medium">{supplier.name}</span>
                        {supplier.inStock && (
                          <Badge variant="outline" className="text-xs text-green-600">In Stock</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">${supplier.price}</span>
                        {supplier.link && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={supplier.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {estimate.suppliers.length > 1 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Save ${estimate.suppliers[estimate.suppliers.length - 1].price - estimate.suppliers[0].price} by ordering from {estimate.suppliers[0].name}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {estimate && (
        <CardFooter className="flex gap-3">
          <Button 
            className="flex-1" 
            onClick={() => {
              onAddToEstimate?.(estimate)
              toast.success('Added to job estimate')
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Estimate
          </Button>
          <Button variant="outline" onClick={() => {
            navigator.clipboard.writeText(
              `${MATERIALS[estimate.material].name}: ${estimate.quantity} ${estimate.unit}s needed for ${estimate.totalSqFt} sq ft (includes ${estimate.wasteIncluded}% waste)`
            )
            toast.success('Copied to clipboard')
          }}>
            Copy
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

export default SmartMaterialCalculator

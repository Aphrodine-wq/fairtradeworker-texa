import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, Clock, Hammer, FileText } from '@phosphor-icons/react'
import { MILESTONE_TEMPLATES } from '@/lib/milestones'

interface ScopeBuilderProps {
  projectType: 'kitchen-remodel' | 'bathroom-remodel' | 'roof-replacement' | 'deck-build' | 'fence-installation' | 'room-addition' | 'custom'
  onComplete: (scope: ProjectScope) => void
}

export interface ProjectScope {
  projectType: string
  itemsChanging: string[]
  selectionLevels: Record<string, string>
  sizeInfo: Record<string, string>
  estimatedPrice: { low: number; high: number }
  estimatedTimeline: string
  requiredTrades: string[]
  permitsNeeded: string[]
  customDescription?: string
}

const PROJECT_CONFIGS = {
  'kitchen-remodel': {
    title: '🍳 Kitchen Remodel',
    items: [
      'Cabinets',
      'Countertops',
      'Backsplash',
      'Flooring',
      'Lighting',
      'Appliances',
      'Plumbing fixtures',
      'Electrical outlets/switches',
      'Paint',
      'Layout changes (walls)'
    ],
    selections: {
      'Cabinets': ['Stock', 'Semi-Custom', 'Custom'],
      'Countertops': ['Laminate', 'Granite', 'Quartz', 'Marble'],
      'Appliances': ['Keep existing', 'Builder grade', 'Mid-range', 'Premium']
    },
    sizes: {
      label: 'Kitchen size',
      options: ['Small <100sqft', 'Medium 100-200sqft', 'Large 200+sqft']
    },
    trades: ['Demolition', 'Electrician', 'Plumber', 'Cabinet installer', 'Countertop fabricator', 'Tile installer', 'Painter'],
    permits: ['Electrical Permit', 'Plumbing Permit', 'Building Permit (if removing/adding walls)'],
    basePrice: { low: 15000, high: 50000 },
    timeline: '4-8 weeks'
  },
  'bathroom-remodel': {
    title: '🚿 Bathroom Remodel',
    items: [
      'Tub/Shower',
      'Toilet',
      'Vanity',
      'Flooring',
      'Tile work',
      'Lighting',
      'Ventilation',
      'Paint',
      'Layout changes'
    ],
    selections: {
      'Tub/Shower': ['Refinish', 'Liner', 'New standard', 'Custom tile'],
      'Vanity': ['Stock', 'Semi-custom', 'Custom'],
      'Flooring': ['Vinyl', 'Tile', 'Heated tile']
    },
    sizes: {
      label: 'Bathroom size',
      options: ['Half bath', 'Full bath', 'Master bath']
    },
    trades: ['Demolition', 'Plumber', 'Electrician', 'Tile installer', 'Painter'],
    permits: ['Plumbing Permit', 'Electrical Permit'],
    basePrice: { low: 8000, high: 35000 },
    timeline: '2-5 weeks'
  },
  'roof-replacement': {
    title: '🏠 Roof Replacement',
    items: [
      'Roof material',
      'Gutters',
      'Fascia repair',
      'Decking repair',
      'Skylights'
    ],
    selections: {
      'Roof type': ['Asphalt shingle', 'Metal', 'Tile', 'Flat'],
      'Condition': ['Overlay possible', 'Tear-off required']
    },
    sizes: {
      label: 'Roof size',
      options: ['<1500sqft', '1500-2500sqft', '2500-4000sqft', '4000+sqft']
    },
    trades: ['Roofing contractor'],
    permits: ['Building Permit'],
    basePrice: { low: 8000, high: 25000 },
    timeline: '2-5 days'
  },
  'deck-build': {
    title: '🪵 Deck Build',
    items: [
      'Decking',
      'Stairs',
      'Railing',
      'Built-in seating',
      'Pergola',
      'Lighting'
    ],
    selections: {
      'Type': ['Wood deck', 'Composite deck', 'Concrete patio', 'Paver patio'],
      'Height': ['Ground level', 'Elevated <4ft', 'Elevated 4ft+']
    },
    sizes: {
      label: 'Deck size',
      options: ['Small <200sqft', 'Medium 200-400sqft', 'Large 400+sqft']
    },
    trades: ['Deck builder', 'Electrician (if lighting)'],
    permits: ['Building Permit'],
    basePrice: { low: 8000, high: 35000 },
    timeline: '1-3 weeks'
  },
  'fence-installation': {
    title: '🚧 Fence Installation',
    items: [
      'Posts',
      'Rails',
      'Pickets/Panels',
      'Gates',
      'Staining/Sealing'
    ],
    selections: {
      'Material': ['Wood', 'Vinyl', 'Metal', 'Composite'],
      'Style': ['Privacy', 'Picket', 'Split rail', 'Chain link']
    },
    sizes: {
      label: 'Fence length',
      options: ['<100 linear ft', '100-200 linear ft', '200-300 linear ft', '300+ linear ft']
    },
    trades: ['Fence contractor'],
    permits: ['Building Permit (sometimes)', 'HOA Approval (if applicable)'],
    basePrice: { low: 3000, high: 15000 },
    timeline: '2-5 days'
  },
  'room-addition': {
    title: '🏗️ Room Addition',
    items: [
      'Foundation',
      'Framing',
      'Roofing',
      'Windows and doors',
      'Electrical',
      'HVAC extension',
      'Plumbing (if bathroom)',
      'Insulation',
      'Drywall',
      'Flooring',
      'Painting',
      'Trim and finish'
    ],
    selections: {
      'Room type': ['Bedroom', 'Bathroom', 'Family room', 'Home office', 'Master suite'],
      'HVAC': ['Extend existing', 'New system', 'Mini-split']
    },
    sizes: {
      label: 'Addition size',
      options: ['<200sqft', '200-400sqft', '400-600sqft', '600+sqft']
    },
    trades: ['General contractor', 'Foundation specialist', 'Framer', 'Roofer', 'Electrician', 'HVAC', 'Plumber', 'Drywall', 'Flooring', 'Painter'],
    permits: ['Building Permit', 'Electrical Permit', 'Mechanical Permit', 'Plumbing Permit (if applicable)'],
    basePrice: { low: 25000, high: 100000 },
    timeline: '6-12 weeks'
  }
}

export function MajorProjectScopeBuilder({ projectType, onComplete }: ScopeBuilderProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [sizeInfo, setSizeInfo] = useState<Record<string, string>>({})
  const [customDescription, setCustomDescription] = useState('')
  
  if (projectType === 'custom') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom Major Project</CardTitle>
          <CardDescription>Describe your project and we&apos;ll help estimate scope and cost</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Project Description</Label>
            <Textarea 
              placeholder="Describe what you want to accomplish..."
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              rows={6}
            />
          </div>
          
          <div>
            <Label>Budget Range</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5-10">$5K-$10K</SelectItem>
                <SelectItem value="10-20">$10K-$20K</SelectItem>
                <SelectItem value="20-35">$20K-$35K</SelectItem>
                <SelectItem value="35-50">$35K-$50K</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={() => {
              onComplete({
                projectType: 'custom',
                itemsChanging: [],
                selectionLevels: {},
                sizeInfo: {},
                estimatedPrice: { low: 5000, high: 50000 },
                estimatedTimeline: '4-12 weeks',
                requiredTrades: [],
                permitsNeeded: [],
                customDescription
              })
            }}
            className="w-full"
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  const config = PROJECT_CONFIGS[projectType]
  
  const calculateEstimate = () => {
    const itemsCount = selectedItems.length
    const totalItems = config.items.length
    const complexity = itemsCount / totalItems
    
    const low = Math.round(config.basePrice.low * (0.5 + complexity * 0.5))
    const high = Math.round(config.basePrice.high * (0.7 + complexity * 0.3))
    
    return { low, high }
  }
  
  const estimate = calculateEstimate()
  
  const handleComplete = () => {
    onComplete({
      projectType,
      itemsChanging: selectedItems,
      selectionLevels: selections,
      sizeInfo,
      estimatedPrice: estimate,
      estimatedTimeline: config.timeline,
      requiredTrades: config.trades,
      permitsNeeded: config.permits
    })
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
          <CardDescription>Select what you&apos;re changing and your preferences</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Items */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Hammer size={20} />
              What&apos;s changing?
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {config.items.map(item => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox 
                    id={item}
                    checked={selectedItems.includes(item)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedItems([...selectedItems, item])
                      } else {
                        setSelectedItems(selectedItems.filter(i => i !== item))
                      }
                    }}
                  />
                  <label htmlFor={item} className="text-sm cursor-pointer">
                    {item}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Step 2: Selections */}
          {Object.keys(config.selections).length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Selection levels</h4>
              <div className="space-y-4">
                {Object.entries(config.selections).map(([item, options]) => (
                  <div key={item}>
                    <Label>{item}</Label>
                    <RadioGroup 
                      value={selections[item]} 
                      onValueChange={(value) => setSelections({ ...selections, [item]: value })}
                      className="flex flex-wrap gap-3 mt-2"
                    >
                      {(options as string[]).map(option => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${item}-${option}`} />
                          <Label htmlFor={`${item}-${option}`} className="font-normal cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 3: Size */}
          {config.sizes && (
            <div>
              <h4 className="font-semibold mb-3">Size/scope</h4>
              <div>
                <Label>{config.sizes.label}</Label>
                <RadioGroup 
                  value={sizeInfo.size} 
                  onValueChange={(value) => setSizeInfo({ ...sizeInfo, size: value })}
                  className="flex flex-wrap gap-3 mt-2"
                >
                  {config.sizes.options.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="font-normal cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Estimate Display */}
      <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb size={24} className="text-black dark:text-white" weight="fill" />
            Estimated Scope
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <span>💰</span> Estimated Price
              </div>
              <div className="text-2xl font-bold">
                ${estimate.low.toLocaleString()} - ${estimate.high.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Clock size={16} /> Timeline
              </div>
              <div className="text-2xl font-bold">
                {config.timeline}
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-sm text-muted-foreground">Required Trades</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {config.trades.map(trade => (
                <Badge key={trade} variant="secondary">{trade}</Badge>
              ))}
            </div>
          </div>
          
          <div>
            <Label className="text-sm text-muted-foreground flex items-center gap-1">
              <FileText size={16} /> Likely Permits
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {config.permits.map(permit => (
                <Badge key={permit} variant="outline">{permit}</Badge>
              ))}
            </div>
          </div>
          
          <Button onClick={handleComplete} className="w-full mt-4" size="lg">
            Continue to Milestones
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

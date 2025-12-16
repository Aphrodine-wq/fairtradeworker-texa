import { useState, useCallback, useMemo } from 'react'
import { Sparkle, Image, Video, InstagramLogo, TiktokLogo, FacebookLogo, PinterestLogo, Download, Share, Copy, Eye, Palette, Clock, Star, ArrowRight, Play } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface ProjectPhoto {
  url: string
  type: 'before' | 'during' | 'after'
  caption?: string
  timestamp: Date
}

interface ProjectStory {
  id: string
  title: string
  narrative: string
  photos: ProjectPhoto[]
  duration: string
  budget: string
  highlights: string[]
  contractorName: string
  contractorLocation: string
  projectType: string
  style: 'modern' | 'rustic' | 'traditional' | 'minimalist'
  platform: 'instagram' | 'tiktok' | 'facebook' | 'pinterest' | 'all'
  generatedAt: Date
}

interface ProjectStoryGeneratorProps {
  projectId?: string
  projectTitle?: string
  beforePhotos?: string[]
  duringPhotos?: string[]
  afterPhotos?: string[]
  contractorName: string
  contractorLocation: string
  onShare?: (story: ProjectStory) => void
}

// Story templates for different project types
const STORY_TEMPLATES = {
  kitchen: {
    intros: [
      "This {year} kitchen hadn't seen an update in decades.",
      "When we first walked into this kitchen, the owners knew it needed a transformation.",
      "A dated kitchen with great bones - our favorite kind of project."
    ],
    middles: [
      "Week 1: Demo revealed {discovery}—{reaction}!",
      "The key to this transformation was {technique}.",
      "We focused on {focus} while preserving {preservation}."
    ],
    conclusions: [
      "Same bones, completely new feel.",
      "The {highlight} really ties the whole space together.",
      "Now it's a kitchen that will serve this family for decades."
    ]
  },
  bathroom: {
    intros: [
      "This bathroom was stuck in the {decade}.",
      "Small space, big transformation potential.",
      "The homeowners wanted spa vibes on a realistic budget."
    ],
    middles: [
      "The tile selection made all the difference.",
      "We maximized every inch of this compact space.",
      "New fixtures and fresh tile completely changed the feel."
    ],
    conclusions: [
      "Now it feels twice the size.",
      "Spa retreat achieved.",
      "Clean, modern, and timeless."
    ]
  },
  exterior: {
    intros: [
      "Curb appeal matters—this home needed some love.",
      "First impressions start at the street.",
      "The bones were solid, the look was dated."
    ],
    middles: [
      "Fresh paint and updated landscaping transformed the approach.",
      "We focused on the entryway as the focal point.",
      "Strategic updates made the biggest impact."
    ],
    conclusions: [
      "Now it stands out on the street for all the right reasons.",
      "The neighbors took notice.",
      "Welcome home has a whole new meaning."
    ]
  },
  general: {
    intros: [
      "Every space has potential waiting to be unlocked.",
      "This project started with a simple question: what if?",
      "The vision was clear from day one."
    ],
    middles: [
      "Quality materials and attention to detail made the difference.",
      "We worked closely with the homeowners throughout.",
      "Every decision was intentional."
    ],
    conclusions: [
      "The final result speaks for itself.",
      "Another happy homeowner, another proud team.",
      "This is why we do what we do."
    ]
  }
}

export function ProjectStoryGenerator({
  projectId,
  projectTitle = 'Kitchen Remodel',
  beforePhotos = [],
  duringPhotos = [],
  afterPhotos = [],
  contractorName,
  contractorLocation,
  onShare
}: ProjectStoryGeneratorProps) {
  const [photos, setPhotos] = useState<ProjectPhoto[]>(() => {
    const all: ProjectPhoto[] = []
    beforePhotos.forEach(url => all.push({ url, type: 'before', timestamp: new Date() }))
    duringPhotos.forEach(url => all.push({ url, type: 'during', timestamp: new Date() }))
    afterPhotos.forEach(url => all.push({ url, type: 'after', timestamp: new Date() }))
    return all.length > 0 ? all : getDemoPhotos()
  })
  const [projectType, setProjectType] = useState<'kitchen' | 'bathroom' | 'exterior' | 'general'>('kitchen')
  const [style, setStyle] = useState<'modern' | 'rustic' | 'traditional' | 'minimalist'>('modern')
  const [platform, setPlatform] = useState<'instagram' | 'tiktok' | 'facebook' | 'pinterest'>('instagram')
  const [generating, setGenerating] = useState(false)
  const [generatedStory, setGeneratedStory] = useState<ProjectStory | null>(null)
  const [customNarrative, setCustomNarrative] = useState('')
  const [duration, setDuration] = useState('3 weeks')
  const [budget, setBudget] = useState('Mid-range')

  // Generate narrative using templates
  const generateNarrative = useCallback(() => {
    const templates = STORY_TEMPLATES[projectType]
    const intro = templates.intros[Math.floor(Math.random() * templates.intros.length)]
    const middle = templates.middles[Math.floor(Math.random() * templates.middles.length)]
    const conclusion = templates.conclusions[Math.floor(Math.random() * templates.conclusions.length)]
    
    // Fill in placeholders
    let narrative = `${intro}\n\n${middle}\n\n${conclusion}`
    narrative = narrative
      .replace('{year}', '1990s')
      .replace('{decade}', '80s')
      .replace('{discovery}', 'original hardwood hiding under linoleum')
      .replace('{reaction}', 'bonus')
      .replace('{technique}', 'maximizing natural light')
      .replace('{focus}', 'functionality')
      .replace('{preservation}', 'the home\'s character')
      .replace('{highlight}', 'custom cabinetry')
    
    return narrative
  }, [projectType])

  // Generate full story
  const generateStory = useCallback(async () => {
    if (photos.length < 2) {
      toast.error('Please add at least a before and after photo')
      return
    }
    
    setGenerating(true)
    
    try {
      // Simulate AI generation (in production, call GPT-4)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const narrative = customNarrative || generateNarrative()
      
      const story: ProjectStory = {
        id: `story-${Date.now()}`,
        title: projectTitle,
        narrative,
        photos,
        duration,
        budget,
        highlights: ['Custom cabinetry', 'Open floor plan', 'Energy-efficient lighting'],
        contractorName,
        contractorLocation,
        projectType,
        style,
        platform,
        generatedAt: new Date()
      }
      
      setGeneratedStory(story)
      toast.success('Story generated!')
      
    } catch (error) {
      toast.error('Failed to generate story')
    } finally {
      setGenerating(false)
    }
  }, [photos, projectTitle, duration, budget, contractorName, contractorLocation, projectType, style, platform, customNarrative, generateNarrative])

  // Share to platform
  const shareStory = useCallback(async (targetPlatform: string) => {
    if (!generatedStory) return
    
    // In production, this would use platform APIs or generate shareable content
    toast.success(`Ready to share on ${targetPlatform}! Opening share dialog...`)
    
    onShare?.(generatedStory)
    
    // Simulate opening share dialog
    if (targetPlatform === 'instagram') {
      // Instagram would need the image downloaded first
      toast.info('Download the image and share via Instagram app')
    }
  }, [generatedStory, onShare])

  // Download generated content
  const downloadContent = useCallback(async (format: 'image' | 'video') => {
    if (!generatedStory) return
    
    toast.success(`Preparing ${format} download...`)
    
    // In production, this would generate the actual content
    // For now, simulate download
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success(`${format === 'image' ? 'Image' : 'Video'} ready for download!`)
  }, [generatedStory])

  // Platform-specific preview
  const PlatformPreview = useMemo(() => {
    if (!generatedStory) return null
    
    const beforePhoto = photos.find(p => p.type === 'before')
    const afterPhoto = photos.find(p => p.type === 'after')
    
    switch (platform) {
      case 'instagram':
        return (
          <div className="bg-white rounded-lg overflow-hidden max-w-sm mx-auto shadow-lg">
            {/* Instagram header */}
            <div className="flex items-center gap-3 p-3 border-b">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500" />
              <span className="font-semibold text-sm">{contractorName}</span>
            </div>
            
            {/* Carousel preview */}
            <div className="relative aspect-square bg-gray-100">
              {afterPhoto && (
                <img 
                  src={afterPhoto.url} 
                  alt="After" 
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {photos.slice(0, 5).map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-white/70'}`} />
                ))}
              </div>
            </div>
            
            {/* Caption */}
            <div className="p-3 space-y-2">
              <div className="flex gap-4">
                <span>❤️</span>
                <span>💬</span>
                <span>📤</span>
              </div>
              <p className="text-sm">
                <span className="font-semibold">{contractorName}</span>{' '}
                {generatedStory.narrative.split('\n')[0].substring(0, 100)}...
              </p>
            </div>
          </div>
        )
      
      case 'tiktok':
        return (
          <div className="bg-black rounded-lg overflow-hidden max-w-xs mx-auto shadow-lg aspect-[9/16]">
            {afterPhoto && (
              <img 
                src={afterPhoto.url} 
                alt="After" 
                className="w-full h-full object-cover"
              />
            )}
            {/* TikTok overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
              <p className="text-white text-sm font-semibold">@{contractorName.toLowerCase().replace(/\s/g, '')}</p>
              <p className="text-white text-xs">{generatedStory.narrative.split('\n')[0].substring(0, 60)}...</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">🏠 HomeReno</Badge>
                <Badge variant="secondary" className="text-xs">✨ Transformation</Badge>
              </div>
            </div>
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Play className="h-8 w-8 text-white ml-1" weight="fill" />
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="bg-white rounded-lg overflow-hidden max-w-md mx-auto shadow-lg">
            {afterPhoto && (
              <img 
                src={afterPhoto.url} 
                alt="After" 
                className="w-full aspect-video object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-semibold">{generatedStory.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{generatedStory.narrative.split('\n')[0]}</p>
              <p className="text-xs text-gray-400 mt-2">{contractorName} • {contractorLocation}</p>
            </div>
          </div>
        )
    }
  }, [generatedStory, platform, photos, contractorName, contractorLocation])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkle className="h-5 w-5 text-primary" />
          Project Story Generator
        </CardTitle>
        <CardDescription>
          Turn your before/after photos into shareable content
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="photos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="photos">
              <Image className="h-4 w-4 mr-2" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="customize">
              <Palette className="h-4 w-4 mr-2" />
              Customize
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedStory}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Before */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Badge variant="secondary">Before</Badge>
                </Label>
                <ScrollArea className="h-40">
                  <div className="space-y-2">
                    {photos.filter(p => p.type === 'before').map((photo, i) => (
                      <img 
                        key={i}
                        src={photo.url} 
                        alt="Before" 
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    ))}
                    {photos.filter(p => p.type === 'before').length === 0 && (
                      <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                        No before photos
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
              
              {/* During */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Badge variant="outline">Progress</Badge>
                </Label>
                <ScrollArea className="h-40">
                  <div className="space-y-2">
                    {photos.filter(p => p.type === 'during').map((photo, i) => (
                      <img 
                        key={i}
                        src={photo.url} 
                        alt="During" 
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    ))}
                    {photos.filter(p => p.type === 'during').length === 0 && (
                      <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                        No progress photos
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
              
              {/* After */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Badge>After</Badge>
                </Label>
                <ScrollArea className="h-40">
                  <div className="space-y-2">
                    {photos.filter(p => p.type === 'after').map((photo, i) => (
                      <img 
                        key={i}
                        src={photo.url} 
                        alt="After" 
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    ))}
                    {photos.filter(p => p.type === 'after').length === 0 && (
                      <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                        No after photos
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
          
          {/* Customize Tab */}
          <TabsContent value="customize" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Type</Label>
                <Select value={projectType} onValueChange={(v) => setProjectType(v as typeof projectType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="bathroom">Bathroom</SelectItem>
                    <SelectItem value="exterior">Exterior</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Style</Label>
                <Select value={style} onValueChange={(v) => setStyle(v as typeof style)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="rustic">Rustic</SelectItem>
                    <SelectItem value="traditional">Traditional</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input 
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 3 weeks"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Budget Range</Label>
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Budget-friendly">Budget-friendly</SelectItem>
                    <SelectItem value="Mid-range">Mid-range</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Custom Narrative (optional)</Label>
              <Textarea 
                value={customNarrative}
                onChange={(e) => setCustomNarrative(e.target.value)}
                placeholder="Let AI generate a narrative, or write your own story here..."
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Target Platform</Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'instagram', icon: InstagramLogo, label: 'Instagram' },
                  { id: 'tiktok', icon: TiktokLogo, label: 'TikTok' },
                  { id: 'facebook', icon: FacebookLogo, label: 'Facebook' },
                  { id: 'pinterest', icon: PinterestLogo, label: 'Pinterest' }
                ].map(({ id, icon: Icon, label }) => (
                  <Button
                    key={id}
                    variant={platform === id ? 'default' : 'outline'}
                    className="flex-col h-16 gap-1"
                    onClick={() => setPlatform(id as typeof platform)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            {generatedStory && (
              <>
                {/* Platform Preview */}
                <div className="py-4">
                  {PlatformPreview}
                </div>
                
                {/* Full Narrative */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Full Narrative</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {generatedStory.narrative}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Share Options */}
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => downloadContent('image')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Image
                  </Button>
                  <Button variant="outline" onClick={() => downloadContent('video')}>
                    <Video className="h-4 w-4 mr-2" />
                    Download Video
                  </Button>
                  <Button onClick={() => shareStory(platform)}>
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={generateStory}
          disabled={generating}
        >
          {generating ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating Story...
            </>
          ) : (
            <>
              <Sparkle className="h-4 w-4 mr-2" />
              Generate Story
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

// Demo photos
function getDemoPhotos(): ProjectPhoto[] {
  return [
    { 
      url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', 
      type: 'before', 
      caption: 'Original kitchen',
      timestamp: new Date(Date.now() - 30 * 86400000)
    },
    { 
      url: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800', 
      type: 'during', 
      caption: 'Demo in progress',
      timestamp: new Date(Date.now() - 20 * 86400000)
    },
    { 
      url: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800', 
      type: 'after', 
      caption: 'Finished kitchen',
      timestamp: new Date()
    }
  ]
}

export default ProjectStoryGenerator

import { useState, useCallback, useEffect, useRef } from 'react'
import { ChatCircleDots, Phone, Camera, CircleNotch, CheckCircle, PaperPlaneTilt, Bell, MapPin, UserCircle, ArrowRight, Image, Lightning, Star, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface SMSPhotoScopeProps {
  userPhone?: string
  userLocation?: {
    zip: string
    city: string
    state: string
  }
  onScopeComplete?: (scope: PhotoScope) => void
}

interface PhotoScope {
  id: string
  photos: string[]
  description: string
  aiAnalysis: {
    projectType: string
    estimatedCost: { low: number; high: number }
    urgency: 'low' | 'medium' | 'high' | 'emergency'
    materials: string[]
    scope: string[]
    recommendations: string[]
  }
  location: {
    address?: string
    zip: string
    city: string
    state: string
  }
  status: 'analyzing' | 'quoted' | 'matched' | 'in_progress' | 'completed'
  quotes: ContractorQuote[]
  createdAt: Date
}

interface ContractorQuote {
  id: string
  contractor: {
    name: string
    avatar?: string
    rating: number
    jobsCompleted: number
    responseTime: string
    specialties: string[]
  }
  price: number
  timeline: string
  message: string
  available: string
  sentAt: Date
}

type ConversationStep = 
  | 'welcome'
  | 'photo_prompt'
  | 'analyzing'
  | 'analysis_complete'
  | 'get_quotes'
  | 'quotes_received'
  | 'confirm_contractor'

interface Message {
  id: string
  type: 'system' | 'user' | 'contractor'
  content: string
  timestamp: Date
  media?: string[]
  options?: { label: string; value: string }[]
}

export function SMSPhotoScope({
  userPhone,
  userLocation = { zip: '78749', city: 'Austin', state: 'TX' }
}: SMSPhotoScopeProps) {
  const [phone, setPhone] = useState(userPhone || '')
  const [step, setStep] = useState<ConversationStep>('welcome')
  const [messages, setMessages] = useState<Message[]>([])
  const [photos, setPhotos] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [scope, setScope] = useState<PhotoScope | null>(null)
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null)
  const [phoneVerified, setPhoneVerified] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Initialize conversation
  useEffect(() => {
    if (messages.length === 0) {
      addSystemMessage(
        `👋 Welcome to Photo Scoper!\n\nText us a photo of your project and we'll:\n• AI-analyze what needs to be done\n• Get you instant quotes from verified contractors\n• Match you with the best pro for the job\n\nStart by entering your phone number below.`,
        [{ label: 'How it works', value: 'how_it_works' }]
      )
    }
  }, [])
  
  const addSystemMessage = (content: string, options?: { label: string; value: string }[]) => {
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      type: 'system',
      content,
      timestamp: new Date(),
      options
    }])
  }
  
  const addUserMessage = (content: string, media?: string[]) => {
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
      media
    }])
  }
  
  const addContractorMessage = (contractor: ContractorQuote['contractor'], content: string) => {
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      type: 'contractor',
      content,
      timestamp: new Date()
    }])
  }
  
  // Verify phone number
  const verifyPhone = useCallback(async () => {
    if (!phone.match(/^\d{10}$/)) {
      toast.error('Please enter a valid 10-digit phone number')
      return
    }
    
    setLoading(true)
    
    // Simulate SMS verification
    await new Promise(r => setTimeout(r, 1500))
    
    setPhoneVerified(true)
    setLoading(false)
    setStep('photo_prompt')
    
    addUserMessage(`📱 ${formatPhone(phone)}`)
    addSystemMessage(
      `✅ Great! You can now text us photos directly at:\n\n📞 **(512) 555-SCOPE**\n\nOr upload photos here to get started. Just snap a pic of what needs work!`,
      [{ label: '📷 Upload Photos', value: 'upload_photos' }]
    )
  }, [phone])
  
  // Format phone for display
  const formatPhone = (p: string) => {
    const clean = p.replace(/\D/g, '')
    if (clean.length === 10) {
      return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6)}`
    }
    return p
  }
  
  // Handle photo upload
  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    setLoading(true)
    
    const newPhotos: string[] = []
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      
      const reader = new FileReader()
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
      newPhotos.push(dataUrl)
    }
    
    if (newPhotos.length > 0) {
      setPhotos(prev => [...prev, ...newPhotos])
      addUserMessage(`📸 Uploaded ${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''}`, newPhotos)
      
      // Start analysis after photos
      setStep('analyzing')
      addSystemMessage('🔍 Analyzing your photos with AI...')
      
      // Simulate AI analysis
      await new Promise(r => setTimeout(r, 3000))
      
      const analysis = generateDemoAnalysis()
      setScope(analysis)
      setStep('analysis_complete')
      
      addSystemMessage(
        `✨ **Analysis Complete!**\n\n` +
        `**Project Type:** ${analysis.aiAnalysis.projectType}\n` +
        `**Estimated Cost:** $${analysis.aiAnalysis.estimatedCost.low.toLocaleString()} - $${analysis.aiAnalysis.estimatedCost.high.toLocaleString()}\n` +
        `**Urgency:** ${analysis.aiAnalysis.urgency.toUpperCase()}\n\n` +
        `**What we see:**\n${analysis.aiAnalysis.scope.map(s => `• ${s}`).join('\n')}\n\n` +
        `Want to get quotes from verified contractors in your area?`,
        [
          { label: 'Yes, get quotes! ✅', value: 'get_quotes' },
          { label: 'Add more photos', value: 'add_photos' },
          { label: 'Add description', value: 'add_description' }
        ]
      )
    }
    
    setLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])
  
  // Handle option selection
  const handleOption = useCallback(async (value: string) => {
    switch (value) {
      case 'how_it_works':
        addUserMessage('How does it work?')
        addSystemMessage(
          `📱 **How Photo Scoper Works:**\n\n` +
          `1️⃣ Text or upload a photo of your project\n` +
          `2️⃣ Our AI analyzes what needs to be done\n` +
          `3️⃣ We send it to verified contractors\n` +
          `4️⃣ You get quotes in under 2 hours\n` +
          `5️⃣ Reply YES to the quote you like\n\n` +
          `No apps, no accounts, no hassle! 🎉`
        )
        break
        
      case 'upload_photos':
        fileInputRef.current?.click()
        break
        
      case 'add_photos':
        fileInputRef.current?.click()
        break
        
      case 'add_description':
        addUserMessage('I want to add more details')
        addSystemMessage(
          'Sure! Tell us more about the project. What specifically needs to be done?'
        )
        break
        
      case 'get_quotes':
        addUserMessage('Yes, get me quotes!')
        setStep('get_quotes')
        addSystemMessage('📤 Sending your project to 5 nearby contractors...')
        
        setLoading(true)
        await new Promise(r => setTimeout(r, 2000))
        
        const quotes = generateDemoQuotes()
        if (scope) {
          setScope({ ...scope, quotes, status: 'quoted' })
        }
        setStep('quotes_received')
        setLoading(false)
        
        addSystemMessage(
          `🎉 **${quotes.length} contractors responded!**\n\n` +
          `Average response time: 47 minutes\n\n` +
          `Check out your quotes below and reply with the contractor number to book.`
        )
        
        // Add each contractor quote as a message
        quotes.forEach((quote, i) => {
          setTimeout(() => {
            addContractorMessage(
              quote.contractor,
              `**${quote.contractor.name}** ⭐ ${quote.contractor.rating}\n` +
              `💰 $${quote.price.toLocaleString()}\n` +
              `📅 ${quote.timeline}\n` +
              `✅ Available: ${quote.available}\n\n` +
              `"${quote.message}"`
            )
          }, i * 500)
        })
        break
        
      default:
        if (value.startsWith('book_')) {
          const contractorId = value.replace('book_', '')
          const quote = scope?.quotes.find(q => q.id === contractorId)
          if (quote) {
            setSelectedContractor(contractorId)
            addUserMessage(`Book ${quote.contractor.name}`)
            addSystemMessage(
              `✅ **Booking confirmed!**\n\n` +
              `${quote.contractor.name} will text you at ${formatPhone(phone)} to confirm details.\n\n` +
              `📅 Expected: ${quote.available}\n` +
              `💰 Quoted price: $${quote.price.toLocaleString()}\n\n` +
              `You'll receive a confirmation text shortly!`
            )
            setStep('confirm_contractor')
            toast.success('Contractor booked!')
          }
        }
    }
  }, [scope, phone])
  
  // Handle description input
  const handleDescriptionSubmit = useCallback(() => {
    if (!description.trim()) return
    
    addUserMessage(description)
    setDescription('')
    
    addSystemMessage(
      'Thanks for the details! That helps contractors give more accurate quotes.',
      [{ label: 'Get quotes now', value: 'get_quotes' }]
    )
  }, [description])
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <ChatCircleDots className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Photo Scoper</CardTitle>
            <CardDescription>Text us a photo, get instant quotes</CardDescription>
          </div>
          {phoneVerified && (
            <Badge variant="outline" className="ml-auto">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-muted/30">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${
                msg.type === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : msg.type === 'contractor'
                  ? 'bg-green-100 dark:bg-green-950/50 border border-green-200 dark:border-green-800'
                  : 'bg-background border'
              } rounded-2xl px-4 py-3`}>
                {msg.type === 'contractor' && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-green-200 dark:border-green-800">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-green-500 text-white">
                        {msg.content.match(/\*\*(.+?)\*\*/)?.[1]?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                      Contractor Quote
                    </span>
                  </div>
                )}
                
                {/* Media */}
                {msg.media && msg.media.length > 0 && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {msg.media.map((url, i) => (
                      <img 
                        key={i}
                        src={url}
                        alt="Uploaded"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
                
                {/* Content with markdown-like formatting */}
                <div className="text-sm whitespace-pre-wrap">
                  {msg.content.split('\n').map((line, i) => {
                    // Bold text
                    line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    return (
                      <span key={i} dangerouslySetInnerHTML={{ __html: line + (i < msg.content.split('\n').length - 1 ? '<br/>' : '') }} />
                    )
                  })}
                </div>
                
                {/* Options */}
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {msg.options.map((opt) => (
                      <Button
                        key={opt.value}
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOption(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                )}
                
                <span className="text-xs opacity-50 mt-2 block">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-background border rounded-2xl px-4 py-3">
                <CircleNotch className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quotes Summary */}
        {step === 'quotes_received' && scope?.quotes && !selectedContractor && (
          <div className="p-4 border-t bg-background">
            <h4 className="font-medium mb-3">Select a contractor:</h4>
            <div className="space-y-2">
              {scope.quotes.map((quote) => (
                <button
                  key={quote.id}
                  onClick={() => handleOption(`book_${quote.id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={quote.contractor.avatar} />
                      <AvatarFallback>{quote.contractor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium">{quote.contractor.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        {quote.contractor.rating}
                        <span>•</span>
                        {quote.contractor.jobsCompleted} jobs
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${quote.price.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{quote.timeline}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input Area */}
        <div className="p-4 border-t">
          {!phoneVerified ? (
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="tel"
                  placeholder="Your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="text-lg"
                />
              </div>
              <Button onClick={verifyPhone} disabled={loading || phone.length !== 10}>
                {loading ? (
                  <CircleNotch className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Phone className="h-4 w-4 mr-2" />
                    Verify
                  </>
                )}
              </Button>
            </div>
          ) : step === 'analysis_complete' || step === 'photo_prompt' ? (
            <div className="flex gap-2">
              <Input
                placeholder="Add more details (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDescriptionSubmit()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <Button onClick={handleDescriptionSubmit} disabled={!description.trim()}>
                <PaperPlaneTilt className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              {step === 'confirm_contractor' 
                ? '✅ Booking confirmed - you\'ll receive a text shortly!'
                : 'Waiting for response...'}
            </div>
          )}
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </CardContent>
      
      {/* SMS Info Footer */}
      <CardFooter className="bg-muted/30 border-t">
        <div className="w-full text-center text-xs text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <ChatCircleDots className="h-4 w-4" />
            Or text photos directly to <strong>(512) 555-SCOPE</strong>
          </p>
          <p className="mt-1">No app needed • Quotes in under 2 hours</p>
        </div>
      </CardFooter>
    </Card>
  )
}

// Demo data generators
function generateDemoAnalysis(): PhotoScope {
  return {
    id: `scope-${Date.now()}`,
    photos: [],
    description: '',
    aiAnalysis: {
      projectType: 'Fence Repair & Replacement',
      estimatedCost: { low: 1200, high: 2800 },
      urgency: 'medium',
      materials: ['Cedar fence boards', 'Post caps', 'Concrete mix', 'Hardware'],
      scope: [
        'Replace 3 damaged fence panels (approx 18 linear feet)',
        'Reset 2 leaning posts with new concrete',
        'Replace broken post caps',
        'Stain to match existing fence'
      ],
      recommendations: [
        'Consider replacing all posts on this section to prevent future issues',
        'Storm damage may be covered by homeowners insurance'
      ]
    },
    location: {
      zip: '78749',
      city: 'Austin',
      state: 'TX'
    },
    status: 'analyzing',
    quotes: [],
    createdAt: new Date()
  }
}

function generateDemoQuotes(): ContractorQuote[] {
  return [
    {
      id: 'quote-1',
      contractor: {
        name: 'Austin Fence Pros',
        rating: 4.9,
        jobsCompleted: 234,
        responseTime: '15 min',
        specialties: ['Fencing', 'Decks', 'Pergolas']
      },
      price: 1650,
      timeline: '2-3 days',
      message: 'I can see the storm damage in your photos. Happy to come out tomorrow for a free in-person estimate. We use premium cedar and all our work is guaranteed.',
      available: 'This week',
      sentAt: new Date()
    },
    {
      id: 'quote-2',
      contractor: {
        name: 'Hill Country Fencing',
        rating: 4.8,
        jobsCompleted: 156,
        responseTime: '32 min',
        specialties: ['Fencing', 'Gates', 'Privacy Screens']
      },
      price: 1450,
      timeline: '3-4 days',
      message: 'Based on your photos, I recommend replacing the full 18ft section for best results. I have cedar in stock and can start Monday.',
      available: 'Monday',
      sentAt: new Date()
    },
    {
      id: 'quote-3',
      contractor: {
        name: 'Martinez Construction',
        rating: 4.7,
        jobsCompleted: 89,
        responseTime: '45 min',
        specialties: ['Fencing', 'Concrete', 'General Repairs']
      },
      price: 1850,
      timeline: '2 days',
      message: 'I noticed the posts look like they need resetting too. My quote includes new concrete footings for all affected posts.',
      available: 'This weekend',
      sentAt: new Date()
    }
  ]
}

export default SMSPhotoScope

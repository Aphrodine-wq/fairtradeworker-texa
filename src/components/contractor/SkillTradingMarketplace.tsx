import { useState, useCallback, useMemo } from 'react'
import { Swap, Handshake, Star, Clock, MapPin, Plus, Search, Filter, CheckCircle, XCircle, Warning, Coins, ArrowsLeftRight, User, Shield } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { toast } from 'sonner'

// Trade skill categories with hourly trade values
const TRADE_SKILLS = {
  'Electrical': { baseValue: 75, icon: '⚡' },
  'Plumbing': { baseValue: 70, icon: '🔧' },
  'HVAC': { baseValue: 80, icon: '❄️' },
  'Carpentry': { baseValue: 55, icon: '🪚' },
  'Roofing': { baseValue: 65, icon: '🏠' },
  'Painting': { baseValue: 45, icon: '🎨' },
  'Drywall': { baseValue: 50, icon: '🧱' },
  'Flooring': { baseValue: 55, icon: '🪵' },
  'Landscaping': { baseValue: 40, icon: '🌳' },
  'Concrete': { baseValue: 60, icon: '🏗️' },
  'Welding': { baseValue: 70, icon: '🔥' },
  'General Labor': { baseValue: 30, icon: '💪' }
}

interface SkillListing {
  id: string
  contractorId: string
  contractorName: string
  contractorAvatar?: string
  contractorRating: number
  contractorReviewCount: number
  skillOffered: keyof typeof TRADE_SKILLS
  hoursOffered: number
  skillNeeded: keyof typeof TRADE_SKILLS
  hoursNeeded: number
  description: string
  location: string
  zipCode: string
  flexibility: 'exact' | 'flexible' | 'open'
  status: 'open' | 'pending' | 'matched' | 'completed'
  createdAt: Date
  expiresAt?: Date
}

interface TradeCredit {
  balance: number
  pending: number
  earned: number
  spent: number
  history: {
    id: string
    type: 'earned' | 'spent' | 'pending'
    amount: number
    description: string
    date: Date
    partnerId: string
    partnerName: string
  }[]
}

interface SkillTradingProps {
  contractorId: string
  contractorName: string
  contractorRating: number
}

export function SkillTradingMarketplace({
  contractorId,
  contractorName,
  contractorRating
}: SkillTradingProps) {
  const [listings, setListings] = useState<SkillListing[]>(getDemoListings())
  const [myListings, setMyListings] = useState<SkillListing[]>([])
  const [credits, setCredits] = useState<TradeCredit>({
    balance: 125,
    pending: 40,
    earned: 280,
    spent: 155,
    history: [
      { id: '1', type: 'earned', amount: 80, description: 'Electrical rough-in for Mike P.', date: new Date(Date.now() - 7 * 86400000), partnerId: '2', partnerName: 'Mike P.' },
      { id: '2', type: 'spent', amount: 55, description: 'Carpentry work from Sarah T.', date: new Date(Date.now() - 14 * 86400000), partnerId: '3', partnerName: 'Sarah T.' },
      { id: '3', type: 'pending', amount: 40, description: 'Pending: Plumbing with Jose R.', date: new Date(Date.now() - 2 * 86400000), partnerId: '4', partnerName: 'Jose R.' }
    ]
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTrade, setFilterTrade] = useState<string>('all')
  const [showNewListing, setShowNewListing] = useState(false)
  const [newListing, setNewListing] = useState({
    skillOffered: '' as keyof typeof TRADE_SKILLS | '',
    hoursOffered: 2,
    skillNeeded: '' as keyof typeof TRADE_SKILLS | '',
    hoursNeeded: 2,
    description: '',
    flexibility: 'flexible' as 'exact' | 'flexible' | 'open'
  })

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      if (listing.contractorId === contractorId) return false // Don't show own listings
      if (listing.status !== 'open') return false
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!listing.skillOffered.toLowerCase().includes(query) &&
            !listing.skillNeeded.toLowerCase().includes(query) &&
            !listing.description.toLowerCase().includes(query)) {
          return false
        }
      }
      
      if (filterTrade !== 'all') {
        if (listing.skillOffered !== filterTrade && listing.skillNeeded !== filterTrade) {
          return false
        }
      }
      
      return true
    })
  }, [listings, searchQuery, filterTrade, contractorId])

  // Calculate trade value difference
  const calculateValueDiff = (listing: SkillListing) => {
    const offeredValue = TRADE_SKILLS[listing.skillOffered].baseValue * listing.hoursOffered
    const neededValue = TRADE_SKILLS[listing.skillNeeded].baseValue * listing.hoursNeeded
    return offeredValue - neededValue
  }

  // Create new listing
  const handleCreateListing = () => {
    if (!newListing.skillOffered || !newListing.skillNeeded) {
      toast.error('Please select skills to offer and need')
      return
    }
    
    const listing: SkillListing = {
      id: `listing-${Date.now()}`,
      contractorId,
      contractorName,
      contractorRating,
      skillOffered: newListing.skillOffered as keyof typeof TRADE_SKILLS,
      hoursOffered: newListing.hoursOffered,
      skillNeeded: newListing.skillNeeded as keyof typeof TRADE_SKILLS,
      hoursNeeded: newListing.hoursNeeded,
      description: newListing.description,
      location: 'Austin, TX',
      zipCode: '78749',
      flexibility: newListing.flexibility,
      status: 'open',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 86400000)
    }
    
    setMyListings(prev => [...prev, listing])
    setShowNewListing(false)
    setNewListing({
      skillOffered: '',
      hoursOffered: 2,
      skillNeeded: '',
      hoursNeeded: 2,
      description: '',
      flexibility: 'flexible'
    })
    toast.success('Trade listing created!')
  }

  // Propose trade
  const handleProposeTrade = (listing: SkillListing) => {
    if (contractorRating < 4.5) {
      toast.error('Minimum 4.5 star rating required to participate in skill trading')
      return
    }
    
    toast.success(`Trade proposal sent to ${listing.contractorName}!`)
    
    // In production, this would create a pending trade
    setListings(prev => prev.map(l => 
      l.id === listing.id ? { ...l, status: 'pending' as const } : l
    ))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Swap className="h-5 w-5 text-primary" />
              Skill Trading
            </CardTitle>
            <CardDescription>
              Trade skills with other contractors - no money changes hands
            </CardDescription>
          </div>
          <Button onClick={() => setShowNewListing(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Post Trade
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="browse" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">
              <Search className="h-4 w-4 mr-2" />
              Browse Trades
            </TabsTrigger>
            <TabsTrigger value="my-trades">
              <ArrowsLeftRight className="h-4 w-4 mr-2" />
              My Trades
            </TabsTrigger>
            <TabsTrigger value="credits">
              <Coins className="h-4 w-4 mr-2" />
              Credits ({credits.balance})
            </TabsTrigger>
          </TabsList>
          
          {/* Browse Trades */}
          <TabsContent value="browse" className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search trades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterTrade} onValueChange={setFilterTrade}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by trade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trades</SelectItem>
                  {Object.keys(TRADE_SKILLS).map(trade => (
                    <SelectItem key={trade} value={trade}>
                      {TRADE_SKILLS[trade as keyof typeof TRADE_SKILLS].icon} {trade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Listings */}
            <ScrollArea className="h-[500px] pr-4">
              {filteredListings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Handshake className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No matching trades found</p>
                  <p className="text-sm">Try adjusting your filters or post your own trade</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredListings.map(listing => {
                    const valueDiff = calculateValueDiff(listing)
                    const offeredSkill = TRADE_SKILLS[listing.skillOffered]
                    const neededSkill = TRADE_SKILLS[listing.skillNeeded]
                    
                    return (
                      <Card key={listing.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={listing.contractorAvatar} />
                              <AvatarFallback>{listing.contractorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{listing.contractorName}</p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                    {listing.contractorRating} ({listing.contractorReviewCount} reviews)
                                    <span>•</span>
                                    <MapPin className="h-3 w-3" />
                                    {listing.location}
                                  </div>
                                </div>
                                <Badge variant={listing.flexibility === 'exact' ? 'secondary' : 'outline'}>
                                  {listing.flexibility}
                                </Badge>
                              </div>
                              
                              {/* Trade Details */}
                              <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                                <div className="text-center">
                                  <p className="text-2xl">{offeredSkill.icon}</p>
                                  <p className="text-sm font-medium">{listing.skillOffered}</p>
                                  <p className="text-xs text-muted-foreground">{listing.hoursOffered}h offered</p>
                                  <p className="text-xs text-green-600">${offeredSkill.baseValue * listing.hoursOffered} value</p>
                                </div>
                                
                                <ArrowsLeftRight className="h-6 w-6 text-muted-foreground" />
                                
                                <div className="text-center">
                                  <p className="text-2xl">{neededSkill.icon}</p>
                                  <p className="text-sm font-medium">{listing.skillNeeded}</p>
                                  <p className="text-xs text-muted-foreground">{listing.hoursNeeded}h needed</p>
                                  <p className="text-xs text-blue-600">${neededSkill.baseValue * listing.hoursNeeded} value</p>
                                </div>
                                
                                {valueDiff !== 0 && (
                                  <div className="ml-auto text-center">
                                    <Badge variant={valueDiff > 0 ? 'default' : 'secondary'}>
                                      {valueDiff > 0 ? '+' : ''}{valueDiff} credits
                                    </Badge>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {valueDiff > 0 ? 'You earn' : 'You pay'}
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              {listing.description && (
                                <p className="text-sm text-muted-foreground">
                                  {listing.description}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  Posted {formatTimeAgo(listing.createdAt)}
                                </p>
                                
                                <Button size="sm" onClick={() => handleProposeTrade(listing)}>
                                  <Handshake className="h-4 w-4 mr-2" />
                                  Propose Trade
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          {/* My Trades */}
          <TabsContent value="my-trades" className="space-y-4">
            {myListings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ArrowsLeftRight className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>You haven't posted any trades yet</p>
                <Button className="mt-4" onClick={() => setShowNewListing(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Trade
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {myListings.map(listing => (
                  <Card key={listing.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{TRADE_SKILLS[listing.skillOffered].icon}</span>
                            <span className="font-medium">{listing.hoursOffered}h {listing.skillOffered}</span>
                            <ArrowsLeftRight className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xl">{TRADE_SKILLS[listing.skillNeeded].icon}</span>
                            <span className="font-medium">{listing.hoursNeeded}h {listing.skillNeeded}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{listing.description}</p>
                        </div>
                        <Badge variant={
                          listing.status === 'open' ? 'default' :
                          listing.status === 'pending' ? 'secondary' :
                          listing.status === 'matched' ? 'outline' : 'default'
                        }>
                          {listing.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Credits */}
          <TabsContent value="credits" className="space-y-4">
            {/* Credit Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{credits.balance}</p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{credits.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{credits.earned}</p>
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-muted-foreground">{credits.spent}</p>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Credit History */}
            <div className="space-y-2">
              <h4 className="font-medium">Credit History</h4>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {credits.history.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {item.type === 'earned' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {item.type === 'spent' && <XCircle className="h-5 w-5 text-red-500" />}
                        {item.type === 'pending' && <Clock className="h-5 w-5 text-yellow-500" />}
                        <div>
                          <p className="text-sm font-medium">{item.description}</p>
                          <p className="text-xs text-muted-foreground">
                            with {item.partnerName} • {formatTimeAgo(item.date)}
                          </p>
                        </div>
                      </div>
                      <p className={`font-medium ${
                        item.type === 'earned' ? 'text-green-600' :
                        item.type === 'spent' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {item.type === 'earned' ? '+' : item.type === 'spent' ? '-' : '~'}{item.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            {/* How Credits Work */}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  How Trade Credits Work
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Credits are based on trade skill hourly values</li>
                  <li>• Imbalanced trades use credits to make up the difference</li>
                  <li>• Only 4.5+ star contractors can participate</li>
                  <li>• All work must be properly permitted regardless of payment</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* New Listing Dialog */}
      <Dialog open={showNewListing} onOpenChange={setShowNewListing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Post a Skill Trade</DialogTitle>
            <DialogDescription>
              Offer your skills in exchange for skills you need
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Skill Offered */}
            <div className="space-y-2">
              <Label>Skill You're Offering</Label>
              <Select 
                value={newListing.skillOffered} 
                onValueChange={(v) => setNewListing(prev => ({ ...prev, skillOffered: v as keyof typeof TRADE_SKILLS }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skill" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TRADE_SKILLS).map(([trade, info]) => (
                    <SelectItem key={trade} value={trade}>
                      {info.icon} {trade} (${info.baseValue}/hr)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={40}
                  value={newListing.hoursOffered}
                  onChange={(e) => setNewListing(prev => ({ ...prev, hoursOffered: parseInt(e.target.value) || 1 }))}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">hours</span>
                {newListing.skillOffered && (
                  <Badge variant="secondary">
                    ${TRADE_SKILLS[newListing.skillOffered].baseValue * newListing.hoursOffered} value
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Skill Needed */}
            <div className="space-y-2">
              <Label>Skill You Need</Label>
              <Select 
                value={newListing.skillNeeded} 
                onValueChange={(v) => setNewListing(prev => ({ ...prev, skillNeeded: v as keyof typeof TRADE_SKILLS }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skill" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TRADE_SKILLS).map(([trade, info]) => (
                    <SelectItem key={trade} value={trade}>
                      {info.icon} {trade} (${info.baseValue}/hr)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={40}
                  value={newListing.hoursNeeded}
                  onChange={(e) => setNewListing(prev => ({ ...prev, hoursNeeded: parseInt(e.target.value) || 1 }))}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">hours</span>
                {newListing.skillNeeded && (
                  <Badge variant="secondary">
                    ${TRADE_SKILLS[newListing.skillNeeded].baseValue * newListing.hoursNeeded} value
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Value Difference */}
            {newListing.skillOffered && newListing.skillNeeded && (
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                {(() => {
                  const offered = TRADE_SKILLS[newListing.skillOffered].baseValue * newListing.hoursOffered
                  const needed = TRADE_SKILLS[newListing.skillNeeded].baseValue * newListing.hoursNeeded
                  const diff = offered - needed
                  return diff === 0 ? (
                    <p className="text-green-600 font-medium">✓ Equal value trade</p>
                  ) : diff > 0 ? (
                    <p className="text-blue-600 font-medium">You'll earn {diff} credits</p>
                  ) : (
                    <p className="text-yellow-600 font-medium">You'll pay {Math.abs(diff)} credits</p>
                  )
                })()}
              </div>
            )}
            
            {/* Description */}
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Describe the work needed or any details..."
                value={newListing.description}
                onChange={(e) => setNewListing(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            {/* Flexibility */}
            <div className="space-y-2">
              <Label>Flexibility</Label>
              <Select 
                value={newListing.flexibility} 
                onValueChange={(v) => setNewListing(prev => ({ ...prev, flexibility: v as 'exact' | 'flexible' | 'open' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exact">Exact match only</SelectItem>
                  <SelectItem value="flexible">Flexible on hours</SelectItem>
                  <SelectItem value="open">Open to alternatives</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateListing}>
              Post Trade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// Helper functions
function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getDemoListings(): SkillListing[] {
  return [
    {
      id: '1',
      contractorId: 'demo-1',
      contractorName: 'Mike Peterson',
      contractorRating: 4.8,
      contractorReviewCount: 47,
      skillOffered: 'Plumbing',
      hoursOffered: 3,
      skillNeeded: 'Electrical',
      hoursNeeded: 2,
      description: 'Need 2 hours of electrical rough-in for a bathroom remodel. Can trade plumbing work.',
      location: 'Austin, TX',
      zipCode: '78749',
      flexibility: 'flexible',
      status: 'open',
      createdAt: new Date(Date.now() - 2 * 3600000)
    },
    {
      id: '2',
      contractorId: 'demo-2',
      contractorName: 'Sarah Thompson',
      contractorRating: 4.9,
      contractorReviewCount: 82,
      skillOffered: 'Carpentry',
      hoursOffered: 4,
      skillNeeded: 'Painting',
      hoursNeeded: 6,
      description: 'Built some custom shelving, need someone to paint them and the surrounding walls.',
      location: 'Round Rock, TX',
      zipCode: '78681',
      flexibility: 'open',
      status: 'open',
      createdAt: new Date(Date.now() - 5 * 3600000)
    },
    {
      id: '3',
      contractorId: 'demo-3',
      contractorName: 'Jose Rodriguez',
      contractorRating: 4.7,
      contractorReviewCount: 35,
      skillOffered: 'HVAC',
      hoursOffered: 2,
      skillNeeded: 'Concrete',
      hoursNeeded: 3,
      description: 'Can install/service HVAC. Need concrete work for an AC pad.',
      location: 'Cedar Park, TX',
      zipCode: '78613',
      flexibility: 'exact',
      status: 'open',
      createdAt: new Date(Date.now() - 8 * 3600000)
    },
    {
      id: '4',
      contractorId: 'demo-4',
      contractorName: 'Lisa Chen',
      contractorRating: 4.6,
      contractorReviewCount: 28,
      skillOffered: 'Flooring',
      hoursOffered: 5,
      skillNeeded: 'Drywall',
      hoursNeeded: 4,
      description: 'Installing LVP flooring. Need drywall repair in same room before I can start.',
      location: 'Pflugerville, TX',
      zipCode: '78660',
      flexibility: 'flexible',
      status: 'open',
      createdAt: new Date(Date.now() - 12 * 3600000)
    }
  ]
}

export default SkillTradingMarketplace

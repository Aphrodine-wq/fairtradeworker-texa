import { useState, useCallback, useMemo } from 'react'
import { CalendarDots, Users, Percent, MapPin, Leaf, Snowflake, Sun, Wind, Bell, Star, Check, Plus, Clock, DollarSign, Trophy, UserPlus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

interface MaintenanceClub {
  id: string
  name: string
  type: 'hvac' | 'gutter' | 'lawn' | 'power_wash' | 'holiday_lights' | 'sprinkler'
  season: 'spring' | 'summer' | 'fall' | 'winter'
  neighborhood: string
  zipCode: string
  memberCount: number
  targetMembers: number
  discount: number
  regularPrice: number
  clubPrice: number
  windowStart: Date
  windowEnd: Date
  status: 'forming' | 'active' | 'scheduled' | 'completed'
  organizer: {
    name: string
    avatar?: string
  }
  members: ClubMember[]
  contractor?: {
    name: string
    rating: number
    avatar?: string
  }
}

interface ClubMember {
  id: string
  name: string
  address: string
  joinedAt: Date
  referralCount: number
  status: 'confirmed' | 'pending'
}

interface SeasonalMaintenanceClubsProps {
  userId: string
  userRole: 'homeowner' | 'contractor'
  userZipCode: string
  userNeighborhood: string
}

// Club types with seasonal info
const CLUB_TYPES = {
  hvac: { 
    name: 'HVAC Tune-Up', 
    icon: '❄️', 
    seasons: ['spring', 'fall'],
    regularPrice: 149,
    description: 'AC/Heating tune-up to ensure efficiency'
  },
  gutter: { 
    name: 'Gutter Cleaning', 
    icon: '🍂', 
    seasons: ['fall'],
    regularPrice: 129,
    description: 'Clear gutters and downspouts of debris'
  },
  lawn: { 
    name: 'Lawn Care', 
    icon: '🌿', 
    seasons: ['spring', 'summer'],
    regularPrice: 89,
    description: 'Fertilization, aeration, and weed control'
  },
  power_wash: { 
    name: 'Power Washing', 
    icon: '💦', 
    seasons: ['spring'],
    regularPrice: 199,
    description: 'Driveway, siding, and deck cleaning'
  },
  holiday_lights: { 
    name: 'Holiday Lights', 
    icon: '🎄', 
    seasons: ['fall', 'winter'],
    regularPrice: 299,
    description: 'Professional light installation'
  },
  sprinkler: { 
    name: 'Sprinkler Winterization', 
    icon: '💧', 
    seasons: ['fall'],
    regularPrice: 79,
    description: 'Blow out and winterize irrigation system'
  }
}

const SEASONS = {
  spring: { icon: Leaf, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' },
  summer: { icon: Sun, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
  fall: { icon: Wind, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  winter: { icon: Snowflake, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' }
}

export function SeasonalMaintenanceClubs({
  userId,
  userRole,
  userZipCode,
  userNeighborhood
}: SeasonalMaintenanceClubsProps) {
  const [clubs, setClubs] = useState<MaintenanceClub[]>(getDemoClubs())
  const [myClubs, setMyClubs] = useState<string[]>(['club-1'])
  const [showCreateClub, setShowCreateClub] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState<string>('all')
  const [newClub, setNewClub] = useState({
    type: '' as keyof typeof CLUB_TYPES | '',
    neighborhood: userNeighborhood,
    targetMembers: 10
  })

  // Filter clubs by season and location
  const filteredClubs = useMemo(() => {
    return clubs.filter(club => {
      if (selectedSeason !== 'all' && club.season !== selectedSeason) return false
      // Show clubs in user's area
      return club.zipCode === userZipCode || club.neighborhood === userNeighborhood
    })
  }, [clubs, selectedSeason, userZipCode, userNeighborhood])

  // Get current season
  const currentSeason = useMemo(() => {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  }, [])

  // Join a club
  const joinClub = useCallback((clubId: string) => {
    setMyClubs(prev => [...prev, clubId])
    setClubs(prev => prev.map(club => {
      if (club.id === clubId) {
        return {
          ...club,
          memberCount: club.memberCount + 1,
          members: [
            ...club.members,
            {
              id: userId,
              name: 'You',
              address: '123 Your St',
              joinedAt: new Date(),
              referralCount: 0,
              status: 'confirmed' as const
            }
          ]
        }
      }
      return club
    }))
    toast.success('You\'ve joined the club! 🎉')
  }, [userId])

  // Leave a club
  const leaveClub = useCallback((clubId: string) => {
    setMyClubs(prev => prev.filter(id => id !== clubId))
    setClubs(prev => prev.map(club => {
      if (club.id === clubId) {
        return {
          ...club,
          memberCount: Math.max(0, club.memberCount - 1),
          members: club.members.filter(m => m.id !== userId)
        }
      }
      return club
    }))
    toast.success('You\'ve left the club')
  }, [userId])

  // Invite neighbor (referral)
  const inviteNeighbor = useCallback((clubId: string) => {
    const shareUrl = `${window.location.origin}/club/${clubId}?ref=${userId}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('Invite link copied! Share with your neighbors for extra 10% off')
  }, [userId])

  // Create new club
  const createClub = useCallback(() => {
    if (!newClub.type) {
      toast.error('Please select a club type')
      return
    }
    
    const clubType = CLUB_TYPES[newClub.type]
    const discount = 25 // Base 25% discount
    const clubPrice = Math.round(clubType.regularPrice * (1 - discount / 100))
    
    const club: MaintenanceClub = {
      id: `club-${Date.now()}`,
      name: `${newClub.neighborhood} ${clubType.name} Club`,
      type: newClub.type,
      season: clubType.seasons[0] as 'spring' | 'summer' | 'fall' | 'winter',
      neighborhood: newClub.neighborhood,
      zipCode: userZipCode,
      memberCount: 1,
      targetMembers: newClub.targetMembers,
      discount,
      regularPrice: clubType.regularPrice,
      clubPrice,
      windowStart: new Date(),
      windowEnd: new Date(Date.now() + 14 * 86400000),
      status: 'forming',
      organizer: {
        name: 'You'
      },
      members: [{
        id: userId,
        name: 'You (Organizer)',
        address: '123 Your St',
        joinedAt: new Date(),
        referralCount: 0,
        status: 'confirmed'
      }]
    }
    
    setClubs(prev => [...prev, club])
    setMyClubs(prev => [...prev, club.id])
    setShowCreateClub(false)
    setNewClub({ type: '', neighborhood: userNeighborhood, targetMembers: 10 })
    
    toast.success('Club created! Start inviting neighbors')
  }, [newClub, userZipCode, userId, userNeighborhood])

  // Bid on club (for contractors)
  const bidOnClub = useCallback((clubId: string) => {
    toast.success('Bid submitted! The club organizer will review.')
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDots className="h-5 w-5 text-primary" />
              Seasonal Maintenance Clubs
            </CardTitle>
            <CardDescription>
              Group buying for recurring maintenance - save up to 30%
            </CardDescription>
          </div>
          {userRole === 'homeowner' && (
            <Button onClick={() => setShowCreateClub(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Start a Club
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="browse" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">
              <MapPin className="h-4 w-4 mr-2" />
              Nearby Clubs
            </TabsTrigger>
            <TabsTrigger value="my-clubs">
              <Users className="h-4 w-4 mr-2" />
              My Clubs ({myClubs.length})
            </TabsTrigger>
            {userRole === 'contractor' && (
              <TabsTrigger value="opportunities">
                <DollarSign className="h-4 w-4 mr-2" />
                Opportunities
              </TabsTrigger>
            )}
          </TabsList>
          
          {/* Browse Clubs */}
          <TabsContent value="browse" className="space-y-4">
            {/* Season Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedSeason === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeason('all')}
              >
                All Seasons
              </Button>
              {Object.entries(SEASONS).map(([season, { icon: Icon, color }]) => (
                <Button
                  key={season}
                  variant={selectedSeason === season ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSeason(season)}
                  className="gap-1"
                >
                  <Icon className={`h-4 w-4 ${selectedSeason !== season ? color : ''}`} />
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                  {season === currentSeason && (
                    <Badge variant="secondary" className="ml-1 text-xs">Now</Badge>
                  )}
                </Button>
              ))}
            </div>
            
            {/* Club List */}
            <ScrollArea className="h-[400px] pr-4">
              {filteredClubs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarDots className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No clubs in your area for this season</p>
                  <Button className="mt-4" onClick={() => setShowCreateClub(true)}>
                    Start the First Club
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredClubs.map(club => {
                    const clubType = CLUB_TYPES[club.type]
                    const seasonInfo = SEASONS[club.season]
                    const SeasonIcon = seasonInfo.icon
                    const isMember = myClubs.includes(club.id)
                    const progress = (club.memberCount / club.targetMembers) * 100
                    
                    return (
                      <Card key={club.id} className={isMember ? 'border-primary' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-lg ${seasonInfo.bg} flex items-center justify-center text-2xl`}>
                              {clubType.icon}
                            </div>
                            
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">{club.name}</h4>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {club.neighborhood}
                                    <span>•</span>
                                    <SeasonIcon className={`h-3 w-3 ${seasonInfo.color}`} />
                                    {club.season.charAt(0).toUpperCase() + club.season.slice(1)}
                                  </div>
                                </div>
                                <Badge variant={
                                  club.status === 'forming' ? 'secondary' :
                                  club.status === 'active' ? 'default' :
                                  club.status === 'scheduled' ? 'outline' : 'default'
                                }>
                                  {club.status}
                                </Badge>
                              </div>
                              
                              {/* Pricing */}
                              <div className="flex items-center gap-4">
                                <div>
                                  <span className="text-2xl font-bold text-green-600">${club.clubPrice}</span>
                                  <span className="text-sm text-muted-foreground line-through ml-2">
                                    ${club.regularPrice}
                                  </span>
                                </div>
                                <Badge variant="default" className="bg-green-500">
                                  Save {club.discount}%
                                </Badge>
                              </div>
                              
                              {/* Progress */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {club.memberCount} / {club.targetMembers} neighbors
                                  </span>
                                  {progress >= 100 && (
                                    <Badge variant="outline" className="text-green-600">
                                      <Check className="h-3 w-3 mr-1" />
                                      Group filled!
                                    </Badge>
                                  )}
                                </div>
                                <Progress value={Math.min(progress, 100)} className="h-2" />
                              </div>
                              
                              {/* Window */}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Service window: {club.windowStart.toLocaleDateString()} - {club.windowEnd.toLocaleDateString()}
                              </div>
                              
                              {/* Actions */}
                              <div className="flex gap-2">
                                {isMember ? (
                                  <>
                                    <Button size="sm" variant="outline" onClick={() => inviteNeighbor(club.id)}>
                                      <UserPlus className="h-4 w-4 mr-1" />
                                      Invite Neighbor (+10% off)
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => leaveClub(club.id)}>
                                      Leave
                                    </Button>
                                  </>
                                ) : (
                                  <Button size="sm" onClick={() => joinClub(club.id)}>
                                    Join Club
                                  </Button>
                                )}
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
          
          {/* My Clubs */}
          <TabsContent value="my-clubs" className="space-y-4">
            {myClubs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>You haven't joined any clubs yet</p>
                <p className="text-sm">Join a club to save on seasonal maintenance!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clubs.filter(c => myClubs.includes(c.id)).map(club => {
                  const clubType = CLUB_TYPES[club.type]
                  
                  return (
                    <Card key={club.id} className="border-primary">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{clubType.icon}</span>
                            <div>
                              <h4 className="font-medium">{club.name}</h4>
                              <p className="text-sm text-muted-foreground">{clubType.description}</p>
                            </div>
                          </div>
                          <Badge>{club.status}</Badge>
                        </div>
                        
                        {/* Members */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Members ({club.members.length})</h5>
                          <div className="flex -space-x-2">
                            {club.members.slice(0, 5).map((member, i) => (
                              <Avatar key={i} className="w-8 h-8 border-2 border-background">
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            ))}
                            {club.members.length > 5 && (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                                +{club.members.length - 5}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Your Savings */}
                        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Your savings</span>
                            <span className="font-bold text-green-600">
                              ${club.regularPrice - club.clubPrice}
                            </span>
                          </div>
                        </div>
                        
                        {/* Referral Bonus */}
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">Refer & Save More</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Invite 3 neighbors and get an extra 10% off your service!
                          </p>
                          <Button size="sm" variant="outline" className="mt-2" onClick={() => inviteNeighbor(club.id)}>
                            <UserPlus className="h-4 w-4 mr-1" />
                            Copy Invite Link
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
          
          {/* Contractor Opportunities */}
          {userRole === 'contractor' && (
            <TabsContent value="opportunities" className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 mb-4">
                <h4 className="font-medium mb-2">Why bid on clubs?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Route optimization: all jobs in one neighborhood</li>
                  <li>• Guaranteed volume: 10-20 homes in one window</li>
                  <li>• Reduced marketing cost per acquisition</li>
                  <li>• Build neighborhood reputation</li>
                </ul>
              </div>
              
              {clubs.filter(c => c.status === 'forming' || c.status === 'active').map(club => {
                const clubType = CLUB_TYPES[club.type]
                const potentialRevenue = club.targetMembers * club.clubPrice
                
                return (
                  <Card key={club.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{clubType.icon}</span>
                          <div>
                            <h4 className="font-medium">{club.name}</h4>
                            <p className="text-sm text-muted-foreground">{club.neighborhood}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Potential Revenue</p>
                          <p className="text-xl font-bold text-green-600">${potentialRevenue}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{club.memberCount}</p>
                          <p className="text-xs text-muted-foreground">Confirmed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{club.targetMembers}</p>
                          <p className="text-xs text-muted-foreground">Target</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">5</p>
                          <p className="text-xs text-muted-foreground">Days</p>
                        </div>
                      </div>
                      
                      <Button className="w-full" onClick={() => bidOnClub(club.id)}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Submit Bid
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
      
      {/* Create Club Dialog */}
      {showCreateClub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Start a Maintenance Club</CardTitle>
              <CardDescription>
                Rally your neighbors for group savings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Select 
                  value={newClub.type} 
                  onValueChange={(v) => setNewClub(prev => ({ ...prev, type: v as keyof typeof CLUB_TYPES }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CLUB_TYPES).map(([key, type]) => (
                      <SelectItem key={key} value={key}>
                        {type.icon} {type.name} - ${type.regularPrice} regular
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Neighborhood</Label>
                <Input 
                  value={newClub.neighborhood}
                  onChange={(e) => setNewClub(prev => ({ ...prev, neighborhood: e.target.value }))}
                  placeholder="e.g., Oak Hill, Circle C"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Target Members</Label>
                <Select 
                  value={newClub.targetMembers.toString()} 
                  onValueChange={(v) => setNewClub(prev => ({ ...prev, targetMembers: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 homes (20% discount)</SelectItem>
                    <SelectItem value="10">10 homes (25% discount)</SelectItem>
                    <SelectItem value="15">15 homes (28% discount)</SelectItem>
                    <SelectItem value="20">20 homes (30% discount)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newClub.type && (
                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                  <p className="text-sm">
                    <span className="font-medium">Estimated savings per home: </span>
                    <span className="text-green-600 font-bold">
                      ${Math.round(CLUB_TYPES[newClub.type].regularPrice * 0.25)}
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowCreateClub(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={createClub} className="flex-1">
                Create Club
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </Card>
  )
}

// Demo clubs
function getDemoClubs(): MaintenanceClub[] {
  return [
    {
      id: 'club-1',
      name: 'Oak Hill HVAC Club',
      type: 'hvac',
      season: 'spring',
      neighborhood: 'Oak Hill',
      zipCode: '78749',
      memberCount: 8,
      targetMembers: 10,
      discount: 25,
      regularPrice: 149,
      clubPrice: 112,
      windowStart: new Date(Date.now() + 7 * 86400000),
      windowEnd: new Date(Date.now() + 14 * 86400000),
      status: 'forming',
      organizer: { name: 'Sarah M.' },
      members: [
        { id: '1', name: 'Sarah M.', address: '123 Oak Dr', joinedAt: new Date(), referralCount: 3, status: 'confirmed' },
        { id: '2', name: 'John D.', address: '125 Oak Dr', joinedAt: new Date(), referralCount: 1, status: 'confirmed' }
      ],
      contractor: { name: 'Cool Air HVAC', rating: 4.8 }
    },
    {
      id: 'club-2',
      name: 'Circle C Gutter Cleaning',
      type: 'gutter',
      season: 'fall',
      neighborhood: 'Circle C Ranch',
      zipCode: '78749',
      memberCount: 12,
      targetMembers: 15,
      discount: 28,
      regularPrice: 129,
      clubPrice: 93,
      windowStart: new Date(Date.now() + 14 * 86400000),
      windowEnd: new Date(Date.now() + 21 * 86400000),
      status: 'active',
      organizer: { name: 'Mike T.' },
      members: [],
      contractor: { name: 'Clean Gutters Pro', rating: 4.9 }
    },
    {
      id: 'club-3',
      name: 'Maple Street Holiday Lights',
      type: 'holiday_lights',
      season: 'fall',
      neighborhood: 'Oak Hill',
      zipCode: '78749',
      memberCount: 6,
      targetMembers: 10,
      discount: 25,
      regularPrice: 299,
      clubPrice: 224,
      windowStart: new Date(Date.now() + 30 * 86400000),
      windowEnd: new Date(Date.now() + 45 * 86400000),
      status: 'forming',
      organizer: { name: 'Lisa K.' },
      members: []
    }
  ]
}

export default SeasonalMaintenanceClubs

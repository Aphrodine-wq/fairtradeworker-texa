import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, Plus, ArrowLeft, ArrowRight, MapPin } from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"

interface Appointment {
  id: string
  title: string
  customerName: string
  date: string
  startTime: string
  endTime: string
  location?: string
  notes?: string
  type: 'consultation' | 'job' | 'follow-up' | 'other'
}

export function EnhancedSchedulingCalendar({ user }: { user: User }) {
  const [appointments, setAppointments] = useKV<Appointment[]>("appointments", [])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
    title: '',
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    type: 'consultation'
  })

  const monthStart = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    return start
  }, [currentDate])

  const monthDays = useMemo(() => {
    const days: Date[] = []
    const start = new Date(monthStart)
    start.setDate(start.getDate() - start.getDay())
    
    for (let i = 0; i < 42; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }
    return days
  }, [monthStart])

  const weekStart = useMemo(() => {
    const start = new Date(currentDate)
    start.setDate(start.getDate() - start.getDay())
    return start
  }, [currentDate])

  const weekDays = useMemo(() => {
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      days.push(day)
    }
    return days
  }, [weekStart])

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(apt => apt.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const handleSaveAppointment = () => {
    if (!newAppointment.title || !newAppointment.date || !newAppointment.customerName) return

    const appointment: Appointment = {
      id: `apt-${Date.now()}`,
      title: newAppointment.title!,
      customerName: newAppointment.customerName!,
      date: newAppointment.date!,
      startTime: newAppointment.startTime || '09:00',
      endTime: newAppointment.endTime || '10:00',
      location: newAppointment.location,
      notes: newAppointment.notes,
      type: newAppointment.type || 'consultation'
    }

    setAppointments([...appointments, appointment])
    setNewAppointment({
      title: '',
      customerName: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      type: 'consultation'
    })
    setShowAddDialog(false)
  }

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction * 7))
    setCurrentDate(newDate)
  }

  const navigateDay = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + direction)
    setCurrentDate(newDate)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
      case 'job': return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
      case 'follow-up': return 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
                <Calendar weight="duotone" size={40} className="text-black dark:text-white" />
                <span className="text-black dark:text-white">Scheduling Calendar</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Month/week/day views with appointment management
              </p>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={18} className="mr-2" />
                  New Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="overflow-hidden flex flex-col p-0 gap-0 h-[95vh]">
                <div className="px-8 pt-6 pb-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
                  <DialogHeader className="text-left">
                    <DialogTitle className="text-2xl">New Appointment</DialogTitle>
                    <DialogDescription>Schedule consultation, job, or follow-up</DialogDescription>
                  </DialogHeader>
                </div>
                <div className="flex-1 overflow-hidden p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={newAppointment.title}
                        onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                        placeholder="e.g., Initial Consultation"
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label>Customer Name</Label>
                      <Input
                        value={newAppointment.customerName}
                        onChange={(e) => setNewAppointment({ ...newAppointment, customerName: e.target.value })}
                        placeholder="Customer name"
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={newAppointment.type} onValueChange={(v: any) => setNewAppointment({ ...newAppointment, type: v })}>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="job">Job</SelectItem>
                          <SelectItem value="follow-up">Follow-Up</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={newAppointment.location}
                        onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })}
                        placeholder="Address or location"
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newAppointment.date}
                        onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                        className="h-11"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={newAppointment.startTime}
                          onChange={(e) => setNewAppointment({ ...newAppointment, startTime: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div>
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={newAppointment.endTime}
                          onChange={(e) => setNewAppointment({ ...newAppointment, endTime: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        value={newAppointment.notes}
                        onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                        placeholder="Additional notes..."
                        className="h-32"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-8 py-4 border-t border-black/10 dark:border-white/10 flex-shrink-0">
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)} className="h-11">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveAppointment} className="h-11">
                      Save Appointment
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* View Tabs */}
          <Tabs value={view} onValueChange={(v: any) => setView(v)}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-white dark:bg-black border border-black/10 dark:border-white/10">
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>

            <TabsContent value="month" className="mt-6">
              <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => navigateMonth(-1)}>
                      <ArrowLeft size={18} />
                    </Button>
                    <CardTitle>
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </CardTitle>
                    <Button variant="outline" onClick={() => navigateMonth(1)}>
                      <ArrowRight size={18} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center font-semibold text-sm text-black dark:text-white">
                        {day}
                      </div>
                    ))}
                    {monthDays.map((day, idx) => {
                      const dayAppointments = getAppointmentsForDate(day)
                      const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                      return (
                        <div
                          key={idx}
                          className={`min-h-[80px] p-1 border border-black/10 dark:border-white/10 ${
                            isCurrentMonth ? 'bg-white dark:bg-black' : 'bg-muted/30'
                          } ${isToday(day) ? 'ring-2 ring-primary' : ''}`}
                        >
                          <div className={`text-xs mb-1 ${isCurrentMonth ? 'text-black dark:text-white' : 'text-muted-foreground'}`}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 2).map(apt => (
                              <div
                                key={apt.id}
                                className={`text-xs p-1 rounded ${getTypeColor(apt.type)} truncate`}
                                title={apt.title}
                              >
                                {apt.startTime} {apt.title}
                              </div>
                            ))}
                            {dayAppointments.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{dayAppointments.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="week" className="mt-6">
              <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => navigateWeek(-1)}>
                      <ArrowLeft size={18} />
                    </Button>
                    <CardTitle>
                      Week of {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </CardTitle>
                    <Button variant="outline" onClick={() => navigateWeek(1)}>
                      <ArrowRight size={18} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {weekDays.map(day => {
                      const dayAppointments = getAppointmentsForDate(day)
                      return (
                        <div key={day.toISOString()} className="border border-black/10 dark:border-white/10 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className={`font-semibold text-lg ${isToday(day) ? 'text-primary' : 'text-black dark:text-white'}`}>
                                {day.toLocaleDateString('en-US', { weekday: 'long' })}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                              </div>
                            </div>
                            <Badge variant="outline">{dayAppointments.length} appointments</Badge>
                          </div>
                          <div className="space-y-2">
                            {dayAppointments.map(apt => (
                              <Card key={apt.id} className="p-3 bg-muted/50">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="font-semibold text-black dark:text-white">{apt.title}</div>
                                    <div className="text-sm text-muted-foreground">{apt.customerName}</div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                      <Clock size={12} />
                                      {apt.startTime} - {apt.endTime}
                                      {apt.location && (
                                        <>
                                          <MapPin size={12} className="ml-2" />
                                          {apt.location}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <Badge className={getTypeColor(apt.type)}>{apt.type}</Badge>
                                </div>
                              </Card>
                            ))}
                            {dayAppointments.length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-4">No appointments</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="day" className="mt-6">
              <Card className="bg-white dark:bg-black border border-black/10 dark:border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => navigateDay(-1)}>
                      <ArrowLeft size={18} />
                    </Button>
                    <CardTitle>
                      {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </CardTitle>
                    <Button variant="outline" onClick={() => navigateDay(1)}>
                      <ArrowRight size={18} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getAppointmentsForDate(currentDate).map(apt => (
                      <Card key={apt.id} className="p-4 bg-white dark:bg-black border border-black/10 dark:border-white/10">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-semibold text-xl text-black dark:text-white">{apt.title}</div>
                            <div className="text-sm text-muted-foreground mt-1">{apt.customerName}</div>
                          </div>
                          <Badge className={getTypeColor(apt.type)}>{apt.type}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock size={16} className="text-muted-foreground" />
                            <span className="text-black dark:text-white">{apt.startTime} - {apt.endTime}</span>
                          </div>
                          {apt.location && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin size={16} className="text-muted-foreground" />
                              <span className="text-black dark:text-white">{apt.location}</span>
                            </div>
                          )}
                          {apt.notes && (
                            <div className="text-sm text-muted-foreground mt-2">
                              {apt.notes}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                    {getAppointmentsForDate(currentDate).length === 0 && (
                      <div className="text-center py-12">
                        <Calendar size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground text-lg">No appointments scheduled</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
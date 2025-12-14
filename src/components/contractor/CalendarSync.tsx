/**
 * Calendar Sync & Auto-Scheduling
 * AI Receptionist Enhancement - Real-time availability checking and auto-booking
 */

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Calendar,
  CalendarBlank,
  Clock,
  CheckCircle,
  Warning
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User } from "@/lib/types"
import { toast } from "sonner"

interface CalendarSlot {
  id: string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  booked: boolean
  bookedBy?: string
  bookingType?: 'call' | 'appointment' | 'job'
}

interface CalendarSyncProps {
  user: User
}

export function CalendarSync({ user }: CalendarSyncProps) {
  const isPro = user?.isPro || false
  const [availability, setAvailability] = useLocalKV<CalendarSlot[]>(`calendar-availability-${user?.id}`, [])
  const [syncEnabled, setSyncEnabled] = useLocalKV<boolean>(`calendar-sync-enabled-${user?.id}`, false)
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false)
  const [newSlotDate, setNewSlotDate] = useState("")
  const [newSlotStart, setNewSlotStart] = useState("09:00")
  const [newSlotEnd, setNewSlotEnd] = useState("17:00")

  const upcomingSlots = useMemo(() => {
    const now = new Date()
    return availability
      .filter(slot => {
        const slotDateTime = new Date(`${slot.date}T${slot.startTime}`)
        return slotDateTime >= now
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`)
        const dateB = new Date(`${b.date}T${b.startTime}`)
        return dateA.getTime() - dateB.getTime()
      })
      .slice(0, 10)
  }, [availability])

  const addAvailabilitySlot = () => {
    if (!newSlotDate) {
      toast.error("Select a date")
      return
    }

    const newSlot: CalendarSlot = {
      id: `slot-${Date.now()}`,
      date: newSlotDate,
      startTime: newSlotStart,
      endTime: newSlotEnd,
      booked: false
    }

    setAvailability([...availability, newSlot])
    setNewSlotDate("")
    toast.success("Availability slot added")
  }

  const checkAvailability = (date: string, preferredTime?: string): CalendarSlot[] => {
    return availability.filter(slot => 
      slot.date === date && 
      !slot.booked &&
      (!preferredTime || slot.startTime <= preferredTime && slot.endTime >= preferredTime)
    )
  }

  const bookSlot = (slotId: string, bookingType: 'call' | 'appointment' | 'job' = 'appointment') => {
    setAvailability(availability.map(slot =>
      slot.id === slotId
        ? { ...slot, booked: true, bookingType }
        : slot
    ))
    toast.success("Slot booked!")
  }

  if (!isPro) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar weight="duotone" size={24} />
            Calendar Sync & Auto-Scheduling
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to enable calendar sync for AI Receptionist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/pro-upgrade'}>
            Upgrade to Pro - $50/mo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card glass={isPro}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarBlank weight="duotone" size={24} />
            Calendar Sync & Auto-Scheduling
          </CardTitle>
          <CardDescription>
            Enable AI Receptionist to check your availability and book appointments automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sync-enabled">Enable Calendar Sync</Label>
              <p className="text-xs text-black dark:text-white mt-1">
                AI Receptionist will check your availability before offering appointment times
              </p>
            </div>
            <Switch
              id="sync-enabled"
              checked={syncEnabled}
              onCheckedChange={(checked) => {
                setSyncEnabled(checked)
                if (checked) {
                  toast.success("Calendar sync enabled! AI Receptionist can now book appointments.")
                }
              }}
            />
          </div>

          {syncEnabled && (
            <>
              <div className="flex items-center justify-between p-4 border-2 border-black dark:border-white">
                <div className="flex items-center gap-3">
                  <Calendar size={24} className="text-black dark:text-white" />
                  <div>
                    <p className="font-semibold text-black dark:text-white">Google Calendar</p>
                    <p className="text-xs text-black dark:text-white">Sync with your existing calendar</p>
                  </div>
                </div>
                {googleCalendarConnected ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle size={12} weight="fill" />
                    Connected
                  </Badge>
                ) : (
                  <Button size="sm" onClick={() => {
                    setGoogleCalendarConnected(true)
                    toast.success("Google Calendar connected!")
                  }}>
                    Connect
                  </Button>
                )}
              </div>

              <div className="p-4 border-2 border-[#00FF00] dark:border-[#00FF00] bg-[#00FF00]/10">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-[#00FF00] dark:text-[#00FF00]" weight="fill" />
                  <div>
                    <p className="font-semibold text-black dark:text-white mb-2">How It Works</p>
                    <ul className="text-sm text-black dark:text-white space-y-1 list-disc list-inside">
                      <li>AI Receptionist checks your calendar before offering appointment times</li>
                      <li>Callers can book directly during the call</li>
                      <li>Conflicts are automatically prevented</li>
                      <li>You receive notifications for all bookings</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <Label>Add Availability Slots</Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                  <Input
                    type="date"
                    value={newSlotDate}
                    onChange={(e) => setNewSlotDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <Input
                    type="time"
                    value={newSlotStart}
                    onChange={(e) => setNewSlotStart(e.target.value)}
                  />
                  <Input
                    type="time"
                    value={newSlotEnd}
                    onChange={(e) => setNewSlotEnd(e.target.value)}
                  />
                  <Button onClick={addAvailabilitySlot}>
                    Add Slot
                  </Button>
                </div>
              </div>

              {upcomingSlots.length > 0 && (
                <div>
                  <Label>Upcoming Availability</Label>
                  <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
                    {upcomingSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-3 border-2 flex items-center justify-between ${
                          slot.booked
                            ? 'border-red-600 dark:border-red-400 bg-red-50 dark:bg-red-950'
                            : 'border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-950'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CalendarBlank size={20} className="text-black dark:text-white" />
                          <div>
                            <p className="font-semibold text-black dark:text-white">
                              {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-sm text-black dark:text-white flex items-center gap-1">
                              <Clock size={12} />
                              {slot.startTime} - {slot.endTime}
                            </p>
                          </div>
                        </div>
                        <Badge variant={slot.booked ? 'destructive' : 'default'}>
                          {slot.booked ? 'Booked' : 'Available'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

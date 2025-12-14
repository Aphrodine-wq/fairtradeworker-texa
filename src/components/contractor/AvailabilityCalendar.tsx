import { useState, useCallback } from "react"
import { CircleNotch } from "@phosphor-icons/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { toast } from "sonner"
import { Calendar, Clock, Plus, Trash } from "@phosphor-icons/react"
import type { TimeSlot, User } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

interface AvailabilityCalendarProps {
  user: User
}

export function AvailabilityCalendar({ user }: AvailabilityCalendarProps) {
  const [timeSlots, setTimeSlots] = useKV<TimeSlot[]>("time-slots", [])
  const [newSlot, setNewSlot] = useState({
    date: "",
    startTime: "",
    endTime: ""
  })

  const mySlots = timeSlots.filter(slot => slot.contractorId === user.id)
  const availableSlots = mySlots.filter(slot => !slot.isBooked)
  const bookedSlots = mySlots.filter(slot => slot.isBooked)

  const [isAdding, setIsAdding] = useState(false)
  const [errors, setErrors] = useState<{
    date?: string
    startTime?: string
    endTime?: string
  }>({})

  const handleAddSlot = useCallback(async () => {
    setErrors({})

    // Validation
    if (!newSlot.date) {
      setErrors({ date: "Date is required" })
      toast.error("Please select a date")
      return
    }

    if (!newSlot.startTime) {
      setErrors({ startTime: "Start time is required" })
      toast.error("Please select a start time")
      return
    }

    if (!newSlot.endTime) {
      setErrors({ endTime: "End time is required" })
      toast.error("Please select an end time")
      return
    }

    const slotDate = new Date(newSlot.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    slotDate.setHours(0, 0, 0, 0)
    
    if (slotDate < today) {
      setErrors({ date: "Cannot add slots in the past" })
      toast.error("Cannot add slots in the past")
      return
    }

    if (newSlot.startTime >= newSlot.endTime) {
      setErrors({ endTime: "End time must be after start time" })
      toast.error("End time must be after start time")
      return
    }

    setIsAdding(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      const slot: TimeSlot = {
        id: uuidv4(),
        contractorId: user.id,
        date: newSlot.date,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        isBooked: false,
        createdAt: new Date().toISOString()
      }

      setTimeSlots([...timeSlots, slot])
      setNewSlot({ date: "", startTime: "", endTime: "" })
      toast.success("Availability slot added!")
    } catch (error) {
      console.error("Error adding slot:", error)
      toast.error("Failed to add slot. Please try again.")
    } finally {
      setIsAdding(false)
    }
  }, [newSlot, timeSlots, user.id, setTimeSlots])

  const handleRemoveSlot = (slotId: string) => {
    const slot = timeSlots.find(s => s.id === slotId)
    if (slot?.isBooked) {
      toast.error("Cannot remove booked slots")
      return
    }

    setTimeSlots(timeSlots.filter(s => s.id !== slotId))
    toast.success("Slot removed")
  }

  const formatSlotTime = (slot: TimeSlot) => {
    const date = new Date(slot.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
    return `${date}, ${slot.startTime} - ${slot.endTime}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar weight="duotone" size={24} />
          My Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Slot Form */}
        <div className="border border-black/20 dark:border-white/20 rounded-md p-4 space-y-4 shadow-sm">
          <h4 className="font-semibold flex items-center gap-2">
            <Plus weight="bold" size={18} />
            Add Available Time Slot
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newSlot.date}
                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={newSlot.startTime}
                onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={newSlot.endTime}
                onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleAddSlot}>
            <Plus className="mr-2" weight="bold" />
            Add Slot
          </Button>
        </div>

        {/* Available Slots */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Clock weight="duotone" size={18} />
            Available Slots ({availableSlots.length})
          </h4>
          {availableSlots.length === 0 ? (
            <div className="text-center py-6 text-black dark:text-white border border-black/20 dark:border-white/20 rounded-md shadow-sm font-mono">
              <Calendar size={32} className="mx-auto mb-2 text-black dark:text-white" />
              <p className="text-sm">No available slots yet. Add your availability above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableSlots
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(slot => (
                  <div key={slot.id} className="flex items-center justify-between p-3 border border-black/20 dark:border-white/20 rounded-md hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all shadow-sm font-mono">
                    <div className="flex items-center gap-3">
                      <Calendar weight="duotone" size={20} className="text-primary" />
                      <div>
                        <p className="font-medium text-sm">{formatSlotTime(slot)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSlot(slot.id)}
                    >
                      <Trash weight="duotone" size={16} />
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Booked Slots */}
        {bookedSlots.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Badge variant="secondary">Booked</Badge>
              Confirmed Appointments ({bookedSlots.length})
            </h4>
            <div className="space-y-2">
              {bookedSlots
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(slot => (
                  <div key={slot.id} className="flex items-center justify-between p-3 border border-black/20 dark:border-white/20 bg-[#00FF00] dark:bg-[#00FF00] rounded-md shadow-sm font-mono">
                    <div className="flex items-center gap-3">
                      <Calendar weight="fill" size={20} className="text-green-600" />
                      <div>
                        <p className="font-medium text-sm">{formatSlotTime(slot)}</p>
                        {slot.jobId && (
                          <p className="text-xs text-black dark:text-white">Job ID: {slot.jobId}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-[#00FF00] text-black border border-black/20 dark:border-white/20">
                      Booked
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

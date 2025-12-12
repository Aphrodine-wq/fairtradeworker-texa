import { Card } from '@/components/ui/card'
import { CalendarCheck, CurrencyDollar, CloudRain, ChatCircle, MapPin } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface DailyBriefingProps {
  scheduledJobs: Array<{
    id: string
    title: string
    time: string
    address: string
    amount: number
    notes?: string
  }>
  expectedEarnings: number
  weatherAlert?: string
  unreadMessages: number
}

export function DailyBriefing({
  scheduledJobs,
  expectedEarnings,
  weatherAlert,
  unreadMessages,
}: DailyBriefingProps) {
  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{greeting}!</h2>
          <p className="text-muted-foreground">Here's your day at a glance</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Expected earnings</p>
          <p className="text-3xl font-bold text-primary">
            ${expectedEarnings.toLocaleString()}
          </p>
        </div>
      </div>
      
      {weatherAlert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <CloudRain className="text-yellow-700" size={20} weight="fill" />
            <div>
              <p className="text-sm font-semibold text-yellow-900">Weather Alert</p>
              <p className="text-sm text-yellow-800">{weatherAlert}</p>
            </div>
          </div>
        </motion.div>
      )}
      
      {unreadMessages > 0 && (
        <Card className="p-4 border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChatCircle className="text-primary" size={20} weight="bold" />
              <p className="text-sm font-medium">Messages need response</p>
            </div>
            <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
              {unreadMessages}
            </span>
          </div>
        </Card>
      )}
      
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CalendarCheck className="text-foreground" size={20} weight="bold" />
          <h3 className="text-lg font-semibold">Today's Schedule</h3>
        </div>
        
        {scheduledJobs.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-2">No jobs scheduled today</p>
            <p className="text-sm text-muted-foreground">
              Check the Browse Jobs tab to find work
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {scheduledJobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold">{job.title}</p>
                      <p className="text-sm text-muted-foreground">{job.time}</p>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      ${job.amount}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin size={14} />
                    <span>{job.address}</span>
                  </div>
                  
                  {job.notes && (
                    <div className="mt-2 p-2 bg-primary/10 rounded text-sm">
                      💡 {job.notes}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground">
          {scheduledJobs.length > 0
            ? `You have ${scheduledJobs.length} job${
                scheduledJobs.length > 1 ? 's' : ''
              } scheduled today. Drive time optimization could save you ~${Math.round(
                scheduledJobs.length * 15 * 0.3
              )} minutes.`
            : 'Stay alert for new job postings. Enable notifications to respond quickly!'}
        </p>
      </div>
    </div>
  )
}

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

interface DailyBriefingPropsWithUser extends DailyBriefingProps {
  user?: { isPro?: boolean }
}

export function DailyBriefing({
  scheduledJobs,
  expectedEarnings,
  weatherAlert,
  unreadMessages,
  user,
}: DailyBriefingPropsWithUser) {
  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'
  const isPro = user?.isPro || false
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">{greeting}!</h2>
          <p className="text-muted-foreground">Let's make today productive.</p>
        </div>
        <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl border border-border">
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Pipeline</p>
            <p className="text-2xl font-bold text-primary">
              ${expectedEarnings.toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CurrencyDollar size={24} className="text-primary" weight="duotone" />
          </div>
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
        <Card className="p-4" glass={isPro}>
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
          <Card className="p-8 text-center border-dashed" glass={isPro}>
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <CalendarCheck size={32} className="text-muted-foreground opacity-50" />
            </div>
            <p className="text-lg font-medium mb-1">Clear Schedule Today</p>
            <p className="text-sm text-muted-foreground mb-4">
              Perfect time to catch up on administrative tasks or find new work.
            </p>
            <button className="text-primary font-semibold hover:underline text-sm">
              Browse Available Jobs &rarr;
            </button>
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
                <Card className="p-4" glass={isPro}>
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

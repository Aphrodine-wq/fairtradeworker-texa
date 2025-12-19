/**
 * Dispute Center (Light)
 * Free Feature - "Issue?" button → form + in-app chat for mediation
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Warning,
  MessageCircle,
  Upload,
  Send
} from "@phosphor-icons/react"
import { useLocalKV } from "@/hooks/useLocalKV"
import type { User, Job } from "@/lib/types"
import { toast } from "sonner"

interface Dispute {
  id: string
  jobId: string
  issueType: 'quality' | 'payment' | 'communication' | 'other'
  description: string
  evidence: string[]
  status: 'open' | 'in-discussion' | 'resolved'
  messages: { from: string; text: string; timestamp: string }[]
  createdAt: string
}

interface DisputeCenterProps {
  user: User
  job: Job
}

export function DisputeCenter({ user, job }: DisputeCenterProps) {
  const [disputes, setDisputes] = useLocalKV<Dispute[]>("disputes", [])
  const [showForm, setShowForm] = useState(false)
  const [issueType, setIssueType] = useState<'quality' | 'payment' | 'communication' | 'other'>('quality')
  const [description, setDescription] = useState("")
  const [evidence, setEvidence] = useState<string[]>([])
  const [newMessage, setNewMessage] = useState("")

  const jobDispute = disputes.find(d => d.jobId === job.id)

  const handleEvidenceUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files) return

      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string
          setEvidence([...evidence, dataUrl])
        }
        reader.readAsDataURL(file)
      })
      toast.success("Evidence uploaded")
    }
    input.click()
  }

  const createDispute = () => {
    if (!description.trim()) {
      toast.error("Please describe the issue")
      return
    }

    const newDispute: Dispute = {
      id: `dispute-${Date.now()}`,
      jobId: job.id,
      issueType,
      description,
      evidence,
      status: 'open',
      messages: [],
      createdAt: new Date().toISOString()
    }

    setDisputes([...disputes, newDispute])
    toast.success("Dispute created. The other party will be notified.")
    setShowForm(false)
    setDescription("")
    setEvidence([])
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !jobDispute) return

    const updated = disputes.map(d => 
      d.id === jobDispute.id
        ? {
            ...d,
            messages: [...d.messages, {
              from: user.id,
              text: newMessage,
              timestamp: new Date().toISOString()
            }],
            status: d.status === 'open' ? 'in-discussion' : d.status
          }
        : d
    )

    setDisputes(updated)
    setNewMessage("")
    toast.success("Message sent")
  }

  if (jobDispute) {
    return (
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warning weight="duotone" size={24} />
            Dispute Discussion
          </CardTitle>
          <CardDescription>
            Issue Type: <Badge>{jobDispute.issueType}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-black dark:text-white mb-2">Issue Description</p>
            <p className="text-sm text-black dark:text-white p-3 bg-white dark:bg-black border-0 shadow-md hover:shadow-lg">
              {jobDispute.description}
            </p>
          </div>

          {jobDispute.evidence.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-black dark:text-white mb-2">Evidence</p>
              <div className="grid grid-cols-3 gap-2">
                {jobDispute.evidence.map((img, idx) => (
                  <img key={idx} src={img} alt={`Evidence ${idx + 1}`} className="w-full h-24 object-cover border-0 shadow-md hover:shadow-lg" />
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-semibold text-black dark:text-white mb-2">Messages</p>
            <div className="space-y-2 max-h-60 overflow-y-auto border-0 shadow-md hover:shadow-lg p-3">
              {jobDispute.messages.length === 0 ? (
                <p className="text-sm text-black dark:text-white">No messages yet</p>
              ) : (
                jobDispute.messages.map((msg, idx) => (
                  <div key={idx} className={`p-2 ${msg.from === user.id ? 'bg-black dark:bg-white text-white dark:text-black ml-auto max-w-[80%]' : 'bg-white dark:bg-black text-black dark:text-white mr-auto max-w-[80%]'} border-0 shadow-md hover:shadow-lg`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={sendMessage}>
              <Send size={16} />
            </Button>
          </div>

          <Badge variant={jobDispute.status === 'resolved' ? 'default' : jobDispute.status === 'in-discussion' ? 'secondary' : 'destructive'}>
            {jobDispute.status}
          </Badge>
        </CardContent>
      </Card>
    )
  }

  if (!showForm) {
    return (
      <Card glass={false}>
        <CardContent className="p-6 text-center">
          <Warning size={48} weight="duotone" className="mx-auto mb-4 text-black dark:text-white opacity-50" />
          <p className="text-black dark:text-white mb-4">Having an issue with this job?</p>
          <Button onClick={() => setShowForm(true)}>
            Report Issue
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card glass={false}>
      <CardHeader>
        <CardTitle>Report Issue</CardTitle>
        <CardDescription>
          We'll help mediate and resolve the issue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Issue Type</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {(['quality', 'payment', 'communication', 'other'] as const).map((type) => (
              <Button
                key={type}
                variant={issueType === type ? 'default' : 'outline'}
                onClick={() => setIssueType(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail..."
            className="mt-2 min-h-[150px]"
          />
        </div>

        <div>
          <Label>Evidence (photos, documents)</Label>
          <Button
            variant="outline"
            onClick={handleEvidenceUpload}
            className="mt-2"
          >
            <Upload size={16} className="mr-2" />
            Upload Evidence
          </Button>
          {evidence.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {evidence.map((img, idx) => (
                <img key={idx} src={img} alt={`Evidence ${idx + 1}`} className="w-full h-24 object-cover border-0 shadow-md hover:shadow-lg" />
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={createDispute} className="flex-1">
            Submit Dispute
          </Button>
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

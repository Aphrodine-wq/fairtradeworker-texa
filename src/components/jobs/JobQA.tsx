import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import { toast } from "sonner"
import { ChatCircle, User } from "@phosphor-icons/react"
import type { Job, Question, User as UserType } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

interface JobQAProps {
  job: Job
  currentUser: UserType
  isContractor?: boolean
}

export function JobQA({ job, currentUser, isContractor = false }: JobQAProps) {
  const [jobs, setJobs] = useKV<Job[]>("jobs", [])
  const [questionText, setQuestionText] = useState("")
  const [answerText, setAnswerText] = useState<Record<string, string>>({})

  const questions = job.questions || []

  const handleAskQuestion = () => {
    if (!questionText.trim()) {
      toast.error("Please enter a question")
      return
    }

    if (!isContractor) {
      toast.error("Only contractors can ask questions")
      return
    }

    const newQuestion: Question = {
      id: uuidv4(),
      jobId: job.id,
      contractorId: currentUser.id,
      contractorName: currentUser.fullName,
      question: questionText.trim(),
      createdAt: new Date().toISOString()
    }

    const updatedJobs = jobs.map(j => 
      j.id === job.id 
        ? { ...j, questions: [...(j.questions || []), newQuestion] }
        : j
    )

    setJobs(updatedJobs)
    setQuestionText("")
    toast.success("Question posted! Homeowner will be notified.")
  }

  const handleAnswerQuestion = (questionId: string) => {
    const answer = answerText[questionId]
    if (!answer?.trim()) {
      toast.error("Please enter an answer")
      return
    }

    const updatedJobs = jobs.map(j => {
      if (j.id === job.id) {
        return {
          ...j,
          questions: (j.questions || []).map(q =>
            q.id === questionId
              ? { ...q, answer: answer.trim(), answeredAt: new Date().toISOString() }
              : q
          )
        }
      }
      return j
    })

    setJobs(updatedJobs)
    setAnswerText(prev => ({ ...prev, [questionId]: "" }))
    toast.success("Answer posted!")
  }

  const isHomeowner = currentUser.id === job.homeownerId

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChatCircle weight="duotone" size={24} />
          Questions & Answers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Questions List */}
        {questions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ChatCircle size={48} className="mx-auto mb-2 opacity-50" />
            <p>No questions yet. Contractors can ask questions visible to all bidders.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User weight="fill" size={16} className="text-muted-foreground" />
                      <span className="font-semibold text-sm">{q.contractorName}</span>
                      <Badge variant="outline" className="text-xs">Contractor</Badge>
                    </div>
                    <p className="text-sm">{q.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(q.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Answer section */}
                {q.answer ? (
                  <div className="bg-muted/50 rounded-lg p-3 mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">Homeowner Answer</Badge>
                      {q.answeredAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(q.answeredAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{q.answer}</p>
                  </div>
                ) : isHomeowner ? (
                  <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <Textarea
                      placeholder="Type your answer here..."
                      value={answerText[q.id] || ""}
                      onChange={(e) => setAnswerText(prev => ({ ...prev, [q.id]: e.target.value }))}
                      className="min-h-[80px]"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAnswerQuestion(q.id)}
                    >
                      Post Answer
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic mt-2">
                    Waiting for homeowner's answer...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ask Question Form (Contractors only) */}
        {isContractor && (
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Ask a Question</h4>
            <div className="space-y-3">
              <Textarea
                placeholder="Type your question here (visible to all bidders)..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="min-h-[100px]"
              />
              <Button onClick={handleAskQuestion}>
                <ChatCircle className="mr-2" weight="duotone" />
                Post Question
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

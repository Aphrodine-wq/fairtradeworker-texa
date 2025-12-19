import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Users, ChatCircle, CheckCircle, Clock, User,
  MapPin, Camera, FileText, Bell, Shield
} from "@phosphor-icons/react"
import { useLocalKV as useKV } from "@/hooks/useLocalKV"
import type { User as UserType, Job } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface Task {
  id: string
  projectId: string
  title: string
  description: string
  assignedTo: string[]
  assignedBy: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  createdAt: string
  completedAt?: string
  location?: string
  photos?: string[]
}

interface Message {
  id: string
  projectId: string
  from: string
  fromName: string
  to?: string
  message: string
  type: 'office' | 'field' | 'all'
  createdAt: string
  read: boolean
}

interface ConstructionCollaborationProps {
  user: UserType
}

export function ConstructionCollaboration({ user }: ConstructionCollaborationProps) {
  const [tasks, setTasks] = useKV<Task[]>("construction-tasks", [])
  const [messages, setMessages] = useKV<Message[]>("construction-messages", [])
  const [jobs] = useKV<Job[]>("jobs", [])
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: [] as string[],
    priority: 'medium' as Task['priority'],
    dueDate: '',
    location: ''
  })
  const [newMessage, setNewMessage] = useState({
    projectId: '',
    message: '',
    type: 'all' as Message['type']
  })

  const myProjects = useMemo(() => {
    return jobs.filter(job =>
      (job.status === 'in-progress' || job.status === 'completed') &&
      job.bids.some(b => b.contractorId === user.id && b.status === 'accepted')
    )
  }, [jobs, user.id])

  const filteredTasks = useMemo(() => {
    if (selectedProject === 'all') return tasks
    return tasks.filter(t => t.projectId === selectedProject)
  }, [tasks, selectedProject])

  const filteredMessages = useMemo(() => {
    if (selectedProject === 'all') return messages
    return messages.filter(m => m.projectId === selectedProject)
  }, [messages, selectedProject])

  const handleCreateTask = () => {
    if (!newTask.title) {
      toast.error("Please enter a task title")
      return
    }

    const task: Task = {
      id: `task-${Date.now()}`,
      projectId: selectedProject === 'all' ? '' : selectedProject,
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo,
      assignedBy: user.id,
      status: 'pending',
      priority: newTask.priority,
      dueDate: newTask.dueDate || undefined,
      createdAt: new Date().toISOString(),
      location: newTask.location || undefined
    }

    setTasks((current) => [...(current || []), task])
    setShowTaskDialog(false)
    setNewTask({ title: '', description: '', assignedTo: [], priority: 'medium', dueDate: '', location: '' })
    toast.success("Task created successfully")
  }

  const handleSendMessage = () => {
    if (!newMessage.message.trim()) {
      toast.error("Please enter a message")
      return
    }

    const message: Message = {
      id: `msg-${Date.now()}`,
      projectId: newMessage.projectId === 'all' ? '' : newMessage.projectId,
      from: user.id,
      fromName: user.fullName,
      message: newMessage.message,
      type: newMessage.type,
      createdAt: new Date().toISOString(),
      read: false
    }

    setMessages((current) => [...(current || []), message])
    setShowMessageDialog(false)
    setNewMessage({ projectId: '', message: '', type: 'all' })
    toast.success("Message sent")
  }

  const handleCompleteTask = (taskId: string) => {
    setTasks((current) =>
      (current || []).map(t =>
        t.id === taskId
          ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString() }
          : t
      )
    )
    toast.success("Task marked as complete")
  }

  const taskStats = useMemo(() => {
    return {
      total: filteredTasks.length,
      pending: filteredTasks.filter(t => t.status === 'pending').length,
      inProgress: filteredTasks.filter(t => t.status === 'in-progress').length,
      completed: filteredTasks.filter(t => t.status === 'completed').length
    }
  }, [filteredTasks])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
            <Users weight="duotone" size={28} className="text-black dark:text-white" />
            Construction Collaboration
          </h2>
          <p className="text-muted-foreground mt-1">
            Office and field team communication, shared tasks, roles, and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CheckCircle size={16} className="mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
                <DialogDescription>
                  Assign a task to your team members
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Task Title</Label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="e.g., Install kitchen cabinets"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Task details and instructions..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(v: any) => setNewTask({ ...newTask, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Due Date (Optional)</Label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Location (Optional)</Label>
                  <Input
                    value={newTask.location}
                    onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
                    placeholder="e.g., Main floor, Room 201"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask}>
                    Create Task
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
            <DialogTrigger asChild>
              <Button>
                <ChatCircle size={16} className="mr-2" />
                Send Message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Message</DialogTitle>
                <DialogDescription>
                  Communicate with your team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Project (Optional)</Label>
                  <Select
                    value={newMessage.projectId}
                    onValueChange={(v) => setNewMessage({ ...newMessage, projectId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {myProjects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Message Type</Label>
                  <Select
                    value={newMessage.type}
                    onValueChange={(v: any) => setNewMessage({ ...newMessage, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Team</SelectItem>
                      <SelectItem value="office">Office Only</SelectItem>
                      <SelectItem value="field">Field Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={newMessage.message}
                    onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                    placeholder="Type your message..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Project Filter */}
      <div>
        <Label>Filter by Project</Label>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {myProjects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Task Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Tasks</span>
              <CheckCircle weight="duotone" size={20} className="text-black dark:text-white" />
            </div>
            <div className="text-2xl font-bold text-black dark:text-white mt-2">
              {taskStats.total}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending</span>
              <Clock weight="duotone" size={20} className="text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-500 mt-2">
              {taskStats.pending}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">In Progress</span>
              <Clock weight="duotone" size={20} className="text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-500 mt-2">
              {taskStats.inProgress}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed</span>
              <CheckCircle weight="duotone" size={20} className="text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-500 mt-2">
              {taskStats.completed}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tasks */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-black dark:text-white">Tasks</h3>
          {filteredTasks.length === 0 ? (
            <Card className="p-8 text-center border-0 shadow-lg hover:shadow-xl">
              <CheckCircle size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
              <p className="text-muted-foreground">No tasks yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map(task => (
                <Card key={task.id} className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-black dark:text-white">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          )}
                        </div>
                        <Badge
                          variant={
                            task.status === 'completed' ? 'default' :
                            task.status === 'in-progress' ? 'outline' :
                            'secondary'
                          }
                        >
                          {task.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {task.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{task.location}</span>
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <Badge variant="outline" className="text-xs capitalize">
                          {task.priority}
                        </Badge>
                      </div>
                      {task.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompleteTask(task.id)}
                          className="w-full"
                        >
                          <CheckCircle size={14} className="mr-2" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-black dark:text-white">Team Messages</h3>
          {filteredMessages.length === 0 ? (
            <Card className="p-8 text-center border-0 shadow-lg hover:shadow-xl">
              <ChatCircle size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
              <p className="text-muted-foreground">No messages yet</p>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredMessages.map(message => (
                <Card key={message.id} className="bg-white dark:bg-black border-0 shadow-lg hover:shadow-xl">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-muted-foreground" />
                          <span className="font-semibold text-sm text-black dark:text-white">
                            {message.fromName}
                          </span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {message.type}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-black dark:text-white">{message.message}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useKV } from '@github/spark/hooks'
import { MagicWand, Image as ImageIcon, Sparkle, ShareNetwork, Eye } from '@phosphor-icons/react'
import type { Job, User } from '@/lib/types'
import { toast } from 'sonner'

interface PortfolioProject {
  id: string
  jobId: string
  title: string
  description: string
  beforePhotos: string[]
  afterPhotos: string[]
  costRange: string
  duration: string
  challenges?: string
  styleTags: string[]
  createdAt: string
  productTags?: string[]
  aiGenerated: boolean
}

interface AutoPortfolioProps {
  user: User
}

export function AutoPortfolio({ user }: AutoPortfolioProps) {
  const [jobs] = useKV<Job[]>('jobs', [])
  const [portfolio, setPortfolio] = useKV<PortfolioProject[]>(`portfolio-${user.id}`, [])
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null)
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)

  const completedJobs = useMemo(() => {
    return (jobs || []).filter(job => 
      job.status === 'completed' && 
      job.bids.some(bid => bid.contractorId === user.id && bid.status === 'accepted')
    )
  }, [jobs, user.id])

  const jobsInPortfolio = useMemo(() => {
    return new Set((portfolio || []).map(p => p.jobId))
  }, [portfolio])

  const availableJobs = useMemo(() => {
    return completedJobs.filter(job => !jobsInPortfolio.has(job.id))
  }, [completedJobs, jobsInPortfolio])

  const generateProjectFromJob = (job: Job) => {
    const styleTags = detectStyleTags(job)
    const costRange = `$${job.aiScope.priceLow.toLocaleString()}-$${job.aiScope.priceHigh.toLocaleString()}`
    
    const project: PortfolioProject = {
      id: `proj-${Date.now()}`,
      jobId: job.id,
      title: job.title,
      description: job.aiScope.scope,
      beforePhotos: job.beforePhotos || [],
      afterPhotos: job.afterPhotos || (job.photos || []),
      costRange,
      duration: job.estimatedDays ? `${job.estimatedDays} days` : '1-3 days',
      styleTags,
      createdAt: new Date().toISOString(),
      aiGenerated: false
    }

    setPortfolio(prev => [...(prev || []), project])
    toast.success('Project added to portfolio!')
  }

  const detectStyleTags = (job: Job): string[] => {
    const tags: string[] = []
    const desc = (job.title + ' ' + job.description + ' ' + job.aiScope.scope).toLowerCase()

    if (desc.includes('modern')) tags.push('Modern')
    if (desc.includes('farmhouse') || desc.includes('rustic')) tags.push('Farmhouse')
    if (desc.includes('efficiency') || desc.includes('energy')) tags.push('Efficiency')
    if (desc.includes('small') || desc.includes('compact')) tags.push('Small Space')
    if (desc.includes('luxury') || desc.includes('premium')) tags.push('Luxury')
    if (desc.includes('budget') || desc.includes('affordable')) tags.push('Budget-Friendly')
    if (desc.includes('eco') || desc.includes('green')) tags.push('Eco-Friendly')

    return tags.length > 0 ? tags : ['General']
  }

  const generateAIStory = async (project: PortfolioProject) => {
    setIsGeneratingStory(true)
    setEditingProject(project)
    
    try {
      const job = (jobs || []).find(j => j.id === project.jobId)
      if (!job) {
        toast.error('Job not found')
        return
      }

      const promptText = `You are a professional contractor writing a compelling portfolio story.

Job Title: ${project.title}
Scope: ${job.aiScope.scope}
Materials Used: ${job.aiScope.materials.join(', ')}
Cost Range: ${project.costRange}
Duration: ${project.duration}

Write a brief, engaging 2-3 sentence story about this project that:
1. Highlights the challenge or problem
2. Explains your solution
3. Emphasizes the result or benefit to the homeowner

Keep it professional but conversational. Focus on value delivered.`

      const story = await window.spark.llm(promptText, 'gpt-4o-mini')
      
      const updatedProject = {
        ...project,
        description: story,
        aiGenerated: true
      }

      setPortfolio(prev => (prev || []).map(p => p.id === project.id ? updatedProject : p))
      setEditingProject(updatedProject)
      toast.success('AI story generated!')
    } catch (error) {
      console.error('Failed to generate story:', error)
      toast.error('Failed to generate story')
    } finally {
      setIsGeneratingStory(false)
    }
  }

  const saveProjectEdit = () => {
    if (!editingProject) return

    setPortfolio(prev => (prev || []).map(p => p.id === editingProject.id ? editingProject : p))
    setEditingProject(null)
    toast.success('Project updated!')
  }

  const deleteProject = (projectId: string) => {
    setPortfolio(prev => (prev || []).filter(p => p.id !== projectId))
    toast.success('Project removed from portfolio')
  }

  const sharePortfolio = () => {
    const url = `${window.location.origin}/contractor/${user.id}/portfolio`
    navigator.clipboard.writeText(url)
    toast.success('Portfolio link copied!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Auto Portfolio</h2>
          <p className="text-black dark:text-white">Your work automatically showcased</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={sharePortfolio}>
            <ShareNetwork className="mr-2 h-4 w-4" />
            Share Portfolio
          </Button>
          <Badge variant="secondary" className="text-base py-2 px-4">
            {(portfolio || []).length} Projects
          </Badge>
        </div>
      </div>

      {availableJobs.length > 0 && (
        <Card className="border border-black/20 dark:border-white/20 bg-white dark:bg-black shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkle className="h-5 w-5 text-primary" />
              Add Completed Jobs to Portfolio
            </CardTitle>
            <CardDescription>
              {availableJobs.length} completed job{availableJobs.length !== 1 ? 's' : ''} ready to showcase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableJobs.slice(0, 3).map(job => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-white dark:bg-black border border-black/20 dark:border-white/20 rounded-md shadow-sm font-mono">
                <div className="flex-1">
                  <div className="font-medium">{job.title}</div>
                  <div className="text-sm text-black dark:text-white">
                    ${job.aiScope.priceLow}-${job.aiScope.priceHigh} • {job.afterPhotos?.length || job.photos?.length || 0} photos
                  </div>
                </div>
                <Button onClick={() => generateProjectFromJob(job)}>
                  Add to Portfolio
                </Button>
              </div>
            ))}
            {availableJobs.length > 3 && (
              <p className="text-sm text-black dark:text-white text-center">
                + {availableJobs.length - 3} more completed jobs
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {(portfolio || []).length === 0 && availableJobs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="h-12 w-12 text-black dark:text-white mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Portfolio Projects Yet</h3>
            <p className="text-black dark:text-white max-w-md">
              Complete jobs and they'll automatically appear here. Add them to your portfolio with one click.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(portfolio || []).map(project => (
          <Card key={project.id} className="overflow-hidden">
            <div className="relative h-48 bg-muted">
              {project.afterPhotos.length > 0 ? (
                <img
                  src={project.afterPhotos[0]}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon className="h-12 w-12 text-black dark:text-white" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                {project.styleTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{project.title}</h3>
              <p className="text-sm text-black dark:text-white mb-3 line-clamp-3">
                {project.description}
              </p>
              <div className="flex items-center justify-between text-xs text-black dark:text-white mb-3">
                <span>{project.costRange}</span>
                <span>{project.duration}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => generateAIStory(project)}
                  disabled={isGeneratingStory}
                >
                  <MagicWand className="mr-1 h-3 w-3" />
                  AI Story
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setEditingProject(project)}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingProject && (
        <div className="fixed inset-0 bg-black dark:bg-white z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Portfolio Project</CardTitle>
              <CardDescription>Customize your project details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Project Title</Label>
                <Input
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                />
              </div>

              <div>
                <Label>Project Story</Label>
                <Textarea
                  rows={5}
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  placeholder="Describe the project, challenges, and results..."
                />
                {editingProject.aiGenerated && (
                  <p className="text-xs text-black dark:text-white mt-1">
                    ✨ Generated by AI - edit as needed
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cost Range</Label>
                  <Input
                    value={editingProject.costRange}
                    onChange={(e) => setEditingProject({ ...editingProject, costRange: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input
                    value={editingProject.duration}
                    onChange={(e) => setEditingProject({ ...editingProject, duration: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Challenges (Optional)</Label>
                <Textarea
                  rows={2}
                  value={editingProject.challenges || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, challenges: e.target.value })}
                  placeholder="Any interesting challenges or obstacles you overcame..."
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteProject(editingProject.id)
                    setEditingProject(null)
                  }}
                >
                  Delete Project
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditingProject(null)}>
                    Cancel
                  </Button>
                  <Button onClick={saveProjectEdit}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

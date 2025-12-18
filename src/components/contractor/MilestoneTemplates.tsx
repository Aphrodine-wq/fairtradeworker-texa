/**
 * Basic Milestone Templates
 * Free Feature - Pre-filled checklists for common jobs
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Checklist,
  Copy
} from "@phosphor-icons/react"
import type { User } from "@/lib/types"

interface MilestoneTemplate {
  id: string
  jobType: string
  milestones: { name: string; description: string; typicalDuration?: string }[]
}

interface MilestoneTemplatesProps {
  user: User
  onUseTemplate?: (template: MilestoneTemplate) => void
}

const defaultTemplates: MilestoneTemplate[] = [
  {
    id: 'kitchen',
    jobType: 'Kitchen Remodel',
    milestones: [
      { name: 'Demolition', description: 'Remove old cabinets, countertops, appliances', typicalDuration: '2-3 days' },
      { name: 'Plumbing Rough-In', description: 'Install new plumbing lines and fixtures', typicalDuration: '1-2 days' },
      { name: 'Electrical Rough-In', description: 'Install new wiring and outlets', typicalDuration: '1-2 days' },
      { name: 'Drywall & Paint', description: 'Patch walls and paint', typicalDuration: '2-3 days' },
      { name: 'Cabinet Installation', description: 'Install new cabinets', typicalDuration: '3-4 days' },
      { name: 'Countertop Installation', description: 'Install countertops', typicalDuration: '1-2 days' },
      { name: 'Appliance Installation', description: 'Install appliances', typicalDuration: '1 day' },
      { name: 'Final Inspection', description: 'Final walkthrough and cleanup', typicalDuration: '1 day' }
    ]
  },
  {
    id: 'bathroom',
    jobType: 'Bathroom Renovation',
    milestones: [
      { name: 'Demolition', description: 'Remove old fixtures, tile, vanity', typicalDuration: '1-2 days' },
      { name: 'Plumbing', description: 'Install new plumbing fixtures', typicalDuration: '2-3 days' },
      { name: 'Electrical', description: 'Install GFCI outlets, lighting', typicalDuration: '1 day' },
      { name: 'Tile Installation', description: 'Install floor and wall tile', typicalDuration: '3-4 days' },
      { name: 'Vanity Installation', description: 'Install new vanity and sink', typicalDuration: '1 day' },
      { name: 'Fixture Installation', description: 'Install toilet, shower, accessories', typicalDuration: '1-2 days' },
      { name: 'Final Inspection', description: 'Final walkthrough', typicalDuration: '1 day' }
    ]
  },
  {
    id: 'roofing',
    jobType: 'Roof Replacement',
    milestones: [
      { name: 'Material Delivery', description: 'Deliver roofing materials', typicalDuration: '1 day' },
      { name: 'Old Roof Removal', description: 'Remove existing shingles and underlayment', typicalDuration: '1-2 days' },
      { name: 'Inspection & Repairs', description: 'Inspect decking, make necessary repairs', typicalDuration: '1 day' },
      { name: 'Underlayment', description: 'Install new underlayment and flashing', typicalDuration: '1 day' },
      { name: 'Shingle Installation', description: 'Install new shingles', typicalDuration: '2-3 days' },
      { name: 'Cleanup', description: 'Remove debris, final inspection', typicalDuration: '1 day' }
    ]
  },
  {
    id: 'flooring',
    jobType: 'Flooring Installation',
    milestones: [
      { name: 'Material Delivery', description: 'Deliver flooring materials', typicalDuration: '1 day' },
      { name: 'Preparation', description: 'Remove old flooring, prep subfloor', typicalDuration: '1-2 days' },
      { name: 'Installation', description: 'Install new flooring', typicalDuration: '2-5 days' },
      { name: 'Trim & Molding', description: 'Install baseboards and transitions', typicalDuration: '1 day' },
      { name: 'Final Cleanup', description: 'Clean and protect new flooring', typicalDuration: '1 day' }
    ]
  }
]

export function MilestoneTemplates({ user, onUseTemplate }: MilestoneTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const template = selectedTemplate ? defaultTemplates.find(t => t.id === selectedTemplate) : null

  const useTemplate = (template: MilestoneTemplate) => {
    if (onUseTemplate) {
      onUseTemplate(template)
    }
  }

  return (
    <div className="space-y-6">
      <Card glass={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Checklist weight="duotone" size={24} />
            Milestone Templates
          </CardTitle>
          <CardDescription>
            Pre-filled milestone checklists for common job types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {defaultTemplates.map((t) => (
              <Card
                key={t.id}
                className={`cursor-pointer border-2 transition-all ${
                  selectedTemplate === t.id
                    ? 'border-[#00FF00] dark:border-[#00FF00] bg-[#00FF00]/10'
                    : 'border-0 shadow-sm'
                }`}
                onClick={() => setSelectedTemplate(t.id)}
              >
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold text-black dark:text-white">{t.jobType}</h3>
                  <p className="text-xs text-black dark:text-white mt-1">
                    {t.milestones.length} milestones
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {template && (
            <div className="mt-6 p-4 border-0 shadow-md hover:shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-black dark:text-white">{template.jobType}</h3>
                <Button onClick={() => useTemplate(template)}>
                  <Copy size={16} className="mr-2" />
                  Use Template
                </Button>
              </div>
              <div className="space-y-3">
                {template.milestones.map((milestone, idx) => (
                  <div key={idx} className="p-3 border-0 shadow-md hover:shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-black dark:text-white">
                          {idx + 1}. {milestone.name}
                        </h4>
                        <p className="text-sm text-black dark:text-white mt-1">
                          {milestone.description}
                        </p>
                        {milestone.typicalDuration && (
                          <Badge variant="outline" className="mt-2">
                            {milestone.typicalDuration}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

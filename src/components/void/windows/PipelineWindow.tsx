/**
 * VOID Pipeline Window - Kanban board for sales pipeline
 */

import { useState } from 'react'
import { motion, Reorder } from 'framer-motion'
import { Plus, GripVertical } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PipelineItem {
  id: string
  name: string
  customer: string
  value: number
  stage: 'lead' | 'contacted' | 'quote' | 'negotiation' | 'won' | 'lost'
}

const STAGES = [
  { id: 'lead', label: 'Lead', color: 'bg-[#00f0ff]' },
  { id: 'contacted', label: 'Contacted', color: 'bg-[#8b5cf6]' },
  { id: 'quote', label: 'Quote Sent', color: 'bg-[#f59e0b]' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-[#f59e0b]' },
  { id: 'won', label: 'Won', color: 'bg-[#10b981]' },
  { id: 'lost', label: 'Lost', color: 'bg-gray-600' },
] as const

export function PipelineWindow() {
  const [items, setItems] = useState<PipelineItem[]>([
    { id: '1', name: 'Kitchen Remodel', customer: 'John Smith', value: 45000, stage: 'negotiation' },
    { id: '2', name: 'Bathroom Renovation', customer: 'Sarah Johnson', value: 28000, stage: 'quote' },
    { id: '3', name: 'Deck Installation', customer: 'Mike Davis', value: 15000, stage: 'won' },
    { id: '4', name: 'Roof Repair', customer: 'Emily Chen', value: 12000, stage: 'contacted' },
    { id: '5', name: 'Basement Finish', customer: 'Robert Wilson', value: 35000, stage: 'lead' },
  ])

  const getItemsByStage = (stage: string) => {
    return items.filter(item => item.stage === stage)
  }

  const moveItem = (itemId: string, newStage: string) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, stage: newStage as PipelineItem['stage'] } : item
    ))
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="p-6 border-b border-[#00f0ff]/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Pipeline</h2>
            <p className="text-sm text-gray-400">{items.length} deals in pipeline</p>
          </div>
          <Button
            className="bg-gradient-to-r from-[#00f0ff] to-[#8b5cf6] hover:from-[#00d0df] hover:to-[#7b4ce6] text-white"
          >
            <Plus size={16} className="mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-max">
          {STAGES.map(stage => {
            const stageItems = getItemsByStage(stage.id)
            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-80 flex flex-col"
              >
                {/* Stage Header */}
                <div className={cn(
                  "p-3 rounded-t-xl mb-2",
                  stage.color,
                  "text-black font-semibold"
                )}>
                  <div className="flex items-center justify-between">
                    <span>{stage.label}</span>
                    <Badge className="bg-black/20 text-black">
                      {stageItems.length}
                    </Badge>
                  </div>
                </div>

                {/* Stage Items */}
                <div className="flex-1 space-y-2 overflow-y-auto">
                  <Reorder.Group
                    axis="y"
                    values={stageItems}
                    onReorder={(newItems) => {
                      setItems(prev => {
                        const otherItems = prev.filter(item => item.stage !== stage.id)
                        return [...otherItems, ...newItems]
                      })
                    }}
                    className="space-y-2"
                  >
                    {stageItems.map(item => (
                      <Reorder.Item
                        key={item.id}
                        value={item}
                        dragListener={false}
                        className={cn(
                          "p-4 rounded-xl border border-[#00f0ff]/20 bg-black/30",
                          "hover:bg-[#00f0ff]/5 hover:border-[#00f0ff]/40 transition-all cursor-move"
                        )}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <GripVertical size={16} className="text-gray-500 mt-0.5" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-sm mb-1">{item.name}</h3>
                            <p className="text-xs text-gray-400">{item.customer}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#00f0ff]/10">
                          <span className="text-sm font-bold text-[#00f0ff]">
                            ${item.value.toLocaleString()}
                          </span>
                          <div className="flex gap-1">
                            {STAGES.map(s => (
                              <button
                                key={s.id}
                                onClick={() => moveItem(item.id, s.id)}
                                className={cn(
                                  "w-2 h-2 rounded-full transition-all",
                                  s.id === item.stage ? s.color : "bg-gray-600 hover:bg-gray-500"
                                )}
                                title={`Move to ${s.label}`}
                              />
                            ))}
                          </div>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>

                  {stageItems.length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-sm rounded-xl border-2 border-dashed border-[#00f0ff]/20">
                      Drop deals here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

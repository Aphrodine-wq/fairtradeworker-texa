/**
 * VOID AI Window - AI assistant and tools
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkle, ChatCircle, FileText, Calculator, Envelope } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface AITool {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

export function AIWindow() {
  const [chatMessage, setChatMessage] = useState('')
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  const aiTools: AITool[] = [
    {
      id: 'chat',
      name: 'Chat with AI',
      description: 'Ask questions and get instant answers',
      icon: <ChatCircle size={24} weight="duotone" />,
      color: 'from-[#00f0ff] to-[#8b5cf6]',
    },
    {
      id: 'email-writer',
      name: 'Email Writer',
      description: 'Generate professional emails',
      icon: <Envelope size={24} weight="duotone" />,
      color: 'from-[#8b5cf6] to-[#00f0ff]',
    },
    {
      id: 'proposal-gen',
      name: 'Proposal Generator',
      description: 'Create detailed project proposals',
      icon: <FileText size={24} weight="duotone" />,
      color: 'from-[#10b981] to-[#00f0ff]',
    },
    {
      id: 'price-estimator',
      name: 'Price Estimator',
      description: 'Get AI-powered price estimates',
      icon: <Calculator size={24} weight="duotone" />,
      color: 'from-[#f59e0b] to-[#8b5cf6]',
    },
  ]

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="p-6 border-b border-[#00f0ff]/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Sparkle size={28} weight="fill" className="text-[#00f0ff]" />
              AI Assistant
            </h2>
            <p className="text-sm text-gray-400">Powered by advanced AI</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Tools Sidebar */}
        <div className="w-64 border-r border-[#00f0ff]/20 p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-[#00f0ff] mb-4 uppercase tracking-wide">
            AI Tools
          </h3>
          <div className="space-y-2">
            {aiTools.map((tool, index) => (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTool(tool.id)}
                className={cn(
                  "w-full p-4 rounded-xl border transition-all text-left",
                  selectedTool === tool.id
                    ? "border-[#00f0ff] bg-[#00f0ff]/10"
                    : "border-[#00f0ff]/20 bg-black/30 hover:bg-[#00f0ff]/5"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2",
                  tool.color
                )}>
                  {tool.icon}
                </div>
                <h4 className="font-semibold text-white mb-1">{tool.name}</h4>
                <p className="text-xs text-gray-400">{tool.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-6">
          {selectedTool === 'chat' ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
                    <Sparkle size={16} weight="fill" className="text-white" />
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-black/30 border border-[#00f0ff]/20">
                    <p className="text-white">
                      Hello! I'm your AI assistant. How can I help you today?
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Ask me anything..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && chatMessage.trim()) {
                      // Handle send
                      setChatMessage('')
                    }
                  }}
                  className="flex-1 bg-black/50 border-[#00f0ff]/30 text-white placeholder:text-gray-500 focus:border-[#00f0ff]"
                />
                <Button
                  className="bg-gradient-to-r from-[#00f0ff] to-[#8b5cf6] hover:from-[#00d0df] hover:to-[#7b4ce6] text-white"
                  onClick={() => {
                    if (chatMessage.trim()) {
                      // Handle send
                      setChatMessage('')
                    }
                  }}
                >
                  Send
                </Button>
              </div>
            </div>
          ) : selectedTool ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 text-lg mb-2">
                  {aiTools.find(t => t.id === selectedTool)?.name}
                </p>
                <p className="text-gray-500 text-sm">Coming soon...</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Sparkle size={64} weight="duotone" className="text-[#00f0ff] mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Select an AI tool to get started</p>
                <p className="text-gray-500 text-sm">Choose from the sidebar to begin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { containerVariants, itemVariants, universalCardHover, modalVariants } from "@/lib/animations"
import { getNavIcon } from "@/lib/types/navigation"
import type { NavItem } from "@/lib/types/navigation"

interface BusinessToolsPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableTools: Array<Omit<NavItem, 'visible' | 'order'>>
  onAddTool: (tool: Omit<NavItem, 'visible' | 'order'>) => void
}

export function BusinessToolsPopup({
  open,
  onOpenChange,
  availableTools,
  onAddTool
}: BusinessToolsPopupProps) {
  const handleToolClick = (tool: Omit<NavItem, 'visible' | 'order'>) => {
    onAddTool(tool)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <DialogHeader>
                <DialogTitle>Add Business Tool</DialogTitle>
                <DialogDescription>
                  Select a tool to add to your navigation
                </DialogDescription>
              </DialogHeader>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6"
              >
                {availableTools.map((tool) => {
                  const Icon = getNavIcon(tool.iconName)
                  return (
                    <motion.div
                      key={tool.id}
                      variants={itemVariants}
                      whileHover={universalCardHover.hover}
                      whileTap={{ scale: 0.98 }}
                      style={{ willChange: 'transform' }}
                    >
                      <Card
                        className="cursor-pointer h-full border-2 border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-colors"
                        onClick={() => handleToolClick(tool)}
                      >
                        <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          >
                            <div className="w-16 h-16 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center mb-3">
                              {Icon ? (
                                <Icon 
                                  size={32} 
                                  weight="fill" 
                                  className="text-black dark:text-white" 
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-black/20 dark:bg-white/20" />
                              )}
                            </div>
                          </motion.div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {tool.label}
                          </h3>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </motion.div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  )
}

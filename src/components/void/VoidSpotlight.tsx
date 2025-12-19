/**
 * VOID OS Spotlight Search
 * Universal search interface (⌘K)
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Search, Clock, ArrowRight } from 'lucide-react'
import { useSpotlight } from '@/hooks/useSpotlight'
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandEmpty } from '@/components/ui/command'
import '@/styles/void-spotlight.css'

export function VoidSpotlight() {
  const {
    isOpen,
    query,
    results,
    recentItems,
    selectedIndex,
    closeSpotlight,
    setQuery,
    selectResult,
  } = useSpotlight()

  if (!isOpen) {
    return null
  }

  const displayResults = query.trim().length > 0 ? results : recentItems

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="void-spotlight-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSpotlight}
          />

          {/* Spotlight Panel */}
          <motion.div
            className="void-system-spotlight void-spotlight"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="void-spotlight-content">
              {/* Search Input */}
              <div className="void-spotlight-input-container">
                <Search className="void-spotlight-search-icon" />
                <input
                  type="text"
                  className="void-spotlight-input"
                  placeholder="Search VOID..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
                <div className="void-spotlight-shortcut">⌘K</div>
              </div>

              {/* Results */}
              <div className="void-spotlight-results">
                {query.trim().length === 0 && recentItems.length > 0 && (
                  <div className="void-spotlight-section">
                    <div className="void-spotlight-section-title">
                      <Clock className="void-spotlight-section-icon" />
                      RECENT
                    </div>
                    {recentItems.map((item, index) => (
                      <div
                        key={item.id}
                        className={`void-spotlight-result ${selectedIndex === index ? 'selected' : ''}`}
                        onClick={() => {
                          item.action()
                          closeSpotlight()
                        }}
                      >
                        <span className="void-spotlight-result-icon">{item.category === 'customers' ? '👤' : item.category === 'leads' ? '🔔' : '📋'}</span>
                        <div className="void-spotlight-result-content">
                          <div className="void-spotlight-result-title">{item.title}</div>
                          <div className="void-spotlight-result-category">{item.category}</div>
                        </div>
                        <ArrowRight className="void-spotlight-result-arrow" />
                      </div>
                    ))}
                  </div>
                )}

                {query.trim().length > 0 && (
                  <>
                    {results.length > 0 ? (
                      <div className="void-spotlight-section">
                        {Object.entries(
                          results.reduce((acc, result) => {
                            if (!acc[result.category]) {
                              acc[result.category] = []
                            }
                            acc[result.category].push(result)
                            return acc
                          }, {} as Record<string, typeof results>)
                        ).map(([category, categoryResults]) => (
                          <div key={category} className="void-spotlight-category">
                            <div className="void-spotlight-section-title">
                              {category.toUpperCase()}
                            </div>
                            {categoryResults.map((result, index) => {
                              const globalIndex = results.indexOf(result)
                              return (
                                <div
                                  key={result.id}
                                  className={`void-spotlight-result ${selectedIndex === globalIndex ? 'selected' : ''}`}
                                  onClick={() => selectResult(result)}
                                >
                                  <span className="void-spotlight-result-icon">{result.icon || '📄'}</span>
                                  <div className="void-spotlight-result-content">
                                    <div className="void-spotlight-result-title">{result.title}</div>
                                    {result.description && (
                                      <div className="void-spotlight-result-description">{result.description}</div>
                                    )}
                                  </div>
                                  <ArrowRight className="void-spotlight-result-arrow" />
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="void-spotlight-empty">
                        <div className="void-spotlight-empty-text">No results found</div>
                        <div className="void-spotlight-empty-hint">Try a different search term</div>
                      </div>
                    )}
                  </>
                )}

                {/* Quick Actions */}
                {query.trim().length === 0 && (
                  <div className="void-spotlight-section">
                    <div className="void-spotlight-section-title">QUICK ACTIONS</div>
                    <div
                      className={`void-spotlight-result ${selectedIndex >= recentItems.length && selectedIndex < recentItems.length + 2 ? 'selected' : ''}`}
                      onClick={() => {
                        console.log('New Lead')
                        closeSpotlight()
                      }}
                    >
                      <span className="void-spotlight-result-icon">➕</span>
                      <div className="void-spotlight-result-content">
                        <div className="void-spotlight-result-title">New Lead</div>
                      </div>
                      <ArrowRight className="void-spotlight-result-arrow" />
                    </div>
                    <div
                      className={`void-spotlight-result ${selectedIndex >= recentItems.length + 1 && selectedIndex < recentItems.length + 3 ? 'selected' : ''}`}
                      onClick={() => {
                        console.log('View Analytics')
                        closeSpotlight()
                      }}
                    >
                      <span className="void-spotlight-result-icon">📊</span>
                      <div className="void-spotlight-result-content">
                        <div className="void-spotlight-result-title">View Analytics</div>
                      </div>
                      <ArrowRight className="void-spotlight-result-arrow" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

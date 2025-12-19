/**
 * Hook for VOID OS Spotlight Search
 */

import { useState, useEffect, useCallback } from 'react'
import { useVoidStore } from '@/lib/void/store'
import { searchSpotlight, getRecentItems, addToRecent, type SpotlightResult, type SpotlightRecentItem } from '@/lib/void/spotlight'

export function useSpotlight() {
  const { spotlightOpen, setSpotlightOpen, spotlightQuery, setSpotlightQuery } = useVoidStore()
  const [results, setResults] = useState<SpotlightResult[]>([])
  const [recentItems, setRecentItems] = useState<SpotlightRecentItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Load recent items
  useEffect(() => {
    setRecentItems(getRecentItems())
  }, [])

  // Search when query changes
  useEffect(() => {
    if (spotlightQuery.trim().length > 0) {
      // TODO: Get actual data from store/API
      const data = {
        customers: [],
        leads: [],
        projects: [],
        invoices: [],
        documents: [],
      }
      const searchResults = searchSpotlight(spotlightQuery, data)
      setResults(searchResults)
      setSelectedIndex(0)
    } else {
      setResults([])
      setSelectedIndex(0)
    }
  }, [spotlightQuery])

  const openSpotlight = useCallback(() => {
    setSpotlightOpen(true)
    setRecentItems(getRecentItems())
  }, [setSpotlightOpen])

  const closeSpotlight = useCallback(() => {
    setSpotlightOpen(false)
    setSpotlightQuery('')
    setResults([])
    setSelectedIndex(0)
  }, [setSpotlightOpen, setSpotlightQuery])

  const selectResult = useCallback((result: SpotlightResult) => {
    addToRecent({
      id: result.id,
      title: result.title,
      category: result.category,
      action: result.action,
    })
    result.action()
    closeSpotlight()
  }, [closeSpotlight])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!spotlightOpen) return

    if (e.key === 'Escape') {
      closeSpotlight()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const maxIndex = results.length > 0 ? results.length - 1 : recentItems.length - 1
      setSelectedIndex(prev => Math.min(prev + 1, maxIndex))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results.length > 0 && selectedIndex < results.length) {
        selectResult(results[selectedIndex])
      } else if (recentItems.length > 0 && selectedIndex < recentItems.length) {
        recentItems[selectedIndex].action()
        closeSpotlight()
      }
    }
  }, [spotlightOpen, results, recentItems, selectedIndex, selectResult, closeSpotlight])

  useEffect(() => {
    if (spotlightOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [spotlightOpen, handleKeyDown])

  return {
    isOpen: spotlightOpen,
    query: spotlightQuery,
    results,
    recentItems,
    selectedIndex,
    openSpotlight,
    closeSpotlight,
    setQuery: setSpotlightQuery,
    selectResult,
  }
}

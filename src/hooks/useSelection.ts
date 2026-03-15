import { useState, useCallback } from 'react'
import type { CanvasImage } from '../types/CanvasImage'

export function useSelection() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [multiSelectedIds, setMultiSelectedIds] = useState<Set<string>>(new Set())

  const select = useCallback((id: string | null, multi: boolean = false) => {
    if (multi) {
      setMultiSelectedIds(prev => {
        const newSet = new Set(prev)
        if (id === null) {
          newSet.clear()
        } else if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        return newSet
      })
      setSelectedId(null)
    } else {
      setSelectedId(id)
      setMultiSelectedIds(new Set())
    }
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedId(null)
    setMultiSelectedIds(new Set())
  }, [])

  const isSelected = useCallback((id: string) => {
    return selectedId === id || multiSelectedIds.has(id)
  }, [selectedId, multiSelectedIds])

  const getSelectedIds = useCallback(() => {
    if (selectedId) return [selectedId]
    return Array.from(multiSelectedIds)
  }, [selectedId, multiSelectedIds])

  return {
    selectedId,
    multiSelectedIds,
    select,
    clearSelection,
    isSelected,
    getSelectedIds
  }
}
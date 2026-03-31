import { useState, useCallback, useEffect } from 'react'
import type { Layer, LayerGroup } from '../types/Layer'
import type { CanvasImage } from '../types/CanvasImage'
import { getNextZIndex } from '../utils/newId'

export function useLayers(initialImages: CanvasImage[]) {
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'default', name: 'Background', visible: true, opacity: 1, zIndex: 0 }
  ])
  
  const [activeLayerId, setActiveLayerId] = useState<string>('default')
  const [layerGroups, setLayerGroups] = useState<LayerGroup[]>([])

  // Organize images by layer
  const imagesByLayer = useCallback(() => {
    const map = new Map<string, CanvasImage[]>()
    
    // Initialize empty arrays for all layers
    layers.forEach(layer => map.set(layer.id, []))
    
    // Add images to their layers
    initialImages.forEach(img => {
      const layer = img.layer
      const layerImages = map.get(layer.id) || []
      layerImages.push(img)
      map.set(layer.id, layerImages)
    })
    
    return map
  }, [layers, initialImages])

  const addLayer = useCallback((options?: Partial<Layer>) => {
    const newLayerIndex = getNextZIndex()
    const newLayer: Layer = {
      id: crypto.randomUUID(),
      name: 'Layer ' + newLayerIndex,
      visible: true,
      opacity: 1,
      zIndex: newLayerIndex,
      ...options
    }
    setLayers(prev => [...prev, newLayer])
    return newLayer
  }, [layers.length])

  const removeLayer = useCallback((layerId: string) => {
    if (layerId === 'default') return // Prevent removing default layer
    setLayers(prev => prev.filter(l => l.id !== layerId))
  }, [])

  const updateLayer = useCallback((layerId: string, updates: Partial<Layer>) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === layerId ? { ...layer, ...updates } : layer
      )
    )
  }, [])

  const moveLayer = useCallback((layerId: string, direction: 'up' | 'down') => {
    if (layerId === 'default') return // Can't move default layer

    setLayers(prev => {
      // Sort layers by zIndex for proper ordering
      const sortedLayers = [...prev].sort((a, b) => a.zIndex - b.zIndex)
      const currentIndex = sortedLayers.findIndex(l => l.id === layerId)
      
      if (currentIndex === -1) return prev

      let targetIndex: number
      if (direction === 'up') {
        // Move up means higher zIndex (towards end of array)
        targetIndex = currentIndex + 1
        // Can't move up if already at the top
        if (targetIndex >= sortedLayers.length) return prev
      } else {
        // Move down means lower zIndex (towards start of array)
        targetIndex = currentIndex - 1
        // Can't move down if already at the bottom (index 0 is default layer)
        if (targetIndex < 1) return prev // Index 0 is always default layer
      }

      // Get the layers to swap
      const currentLayer = sortedLayers[currentIndex]
      const targetLayer = sortedLayers[targetIndex]

      // Swap zIndex values
      const currentZIndex = currentLayer.zIndex
      const targetZIndex = targetLayer.zIndex

      // Create new layers array with swapped zIndices
      const updatedLayers = prev.map(layer => {
        if (layer.id === currentLayer.id) {
          return { ...layer, zIndex: targetZIndex }
        }
        if (layer.id === targetLayer.id) {
          return { ...layer, zIndex: currentZIndex }
        }
        return layer
      })

      return updatedLayers
    })
  }, [])

  const assignToLayer = useCallback((imageId: string, layerId: string) => {
    // This will be called from canvas component
    // The actual image update will be handled by the parent
    return { imageId, layerId }
  }, [])

    // Helper to get layers sorted by zIndex (ascending)
  const getSortedLayers = useCallback(() => {
    return [...layers].sort((a, b) => a.zIndex - b.zIndex)
  }, [layers])

  return {
    layers,
    activeLayerId,
    layerGroups,
    imagesByLayer,
    addLayer,
    removeLayer,
    updateLayer,
    moveLayer,
    assignToLayer,
    setActiveLayerId
  }
}
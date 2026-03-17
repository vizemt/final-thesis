import { useState, useCallback, useEffect } from 'react'
import type { Layer, LayerGroup } from '../types/Layer'
import type { CanvasImage } from '../types/CanvasImage'

export function useLayers(initialImages: CanvasImage[]) {
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'default', name: 'Background', visible: true, opacity: 1, zIndex: 0 },
    { id: 'layer1', name: 'Layer 1', visible: true, opacity: 1, zIndex: 1 },
    { id: 'layer2', name: 'Layer 2', visible: true, opacity: 1, zIndex: 2 },
    { id: 'ui', name: 'UI Overlay', visible: true, opacity: 1, zIndex: 100 }
  ])
  
  const [activeLayerId, setActiveLayerId] = useState<string>('layer1')
  const [layerGroups, setLayerGroups] = useState<LayerGroup[]>([])

  // Organize images by layer
  const imagesByLayer = useCallback(() => {
    const map = new Map<string, CanvasImage[]>()
    
    // Initialize empty arrays for all layers
    layers.forEach(layer => map.set(layer.id, []))
    
    // Add images to their respective layers
    initialImages.forEach(img => {
      const layerId = img.layerId || 'default'
      const layerImages = map.get(layerId) || []
      layerImages.push(img)
      map.set(layerId, layerImages)
    })
    
    return map
  }, [layers, initialImages])

  const addLayer = useCallback((name: string, options?: Partial<Layer>) => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name,
      visible: true,
      opacity: 1,
      zIndex: layers.length,
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
    setLayers(prev => {
      const index = prev.findIndex(l => l.id === layerId)
      if (index === -1) return prev
      
      const newIndex = direction === 'up' 
        ? Math.min(index + 1, prev.length - 1)
        : Math.max(index - 1, 0)
      
      if (newIndex === index) return prev
      
      const newLayers = [...prev]
      const [movedLayer] = newLayers.splice(index, 1)
      newLayers.splice(newIndex, 0, movedLayer)
      
      // Update zIndex based on new order
      return newLayers.map((layer, idx) => ({
        ...layer,
        zIndex: idx
      }))
    })
  }, [])

  const assignToLayer = useCallback((imageId: string, layerId: string) => {
    // This will be called from canvas component
    // The actual image update will be handled by the parent
    return { imageId, layerId }
  }, [])

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
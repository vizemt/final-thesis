import { useState, useRef, useCallback, useEffect } from "react"
import { FederatedPointerEvent, Container } from "pixi.js"
import type { CanvasImage } from "../../types/CanvasImage"

type DragOffset = {
  x: number
  y: number
}

export function useDraggableSprites(initialImages: CanvasImage[]) {
  const [images, setImages] = useState<CanvasImage[]>(initialImages)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragOffset = useRef<DragOffset>({ x: 0, y: 0 })
  const containerRef = useRef<Container>(null)

  // Update images when props change
  useEffect(() => {
    console.log('useDraggableSprites received new images:', initialImages.length)
    setImages(initialImages)
  }, [initialImages])

  const handleDragStart = useCallback((id: string, event: FederatedPointerEvent) => {
    const image = images.find(img => img.id === id)
    if (!image || !containerRef.current) return

    const globalPos = event.global
    const localPos = containerRef.current.toLocal(globalPos)
    
    dragOffset.current = {
      x: localPos.x - image.x,
      y: localPos.y - image.y
    }

    setDraggingId(id)
  }, [images])

  const handleDragMove = useCallback((id: string, event: FederatedPointerEvent) => {
    if (draggingId !== id || !containerRef.current) return

    const globalPos = event.global
    const localPos = containerRef.current.toLocal(globalPos)
    
    setImages(prev => 
      prev.map(img => 
        img.id === id 
          ? { 
              ...img, 
              x: localPos.x - dragOffset.current.x,
              y: localPos.y - dragOffset.current.y
            }
          : img
      )
    )
  }, [draggingId])

  const handleDragEnd = useCallback((id: string, event: FederatedPointerEvent) => {
    setDraggingId(null)
  }, [])

  const updateImagePosition = useCallback((id: string, x: number, y: number) => {
    console.log('updateImagePosition:', id, x, y) // Add this
    setImages(prev =>
      prev.map(img =>
        img.id === id ? { ...img, x, y } : img
      )
    )
  }, [])

  const updateImageTransform = useCallback((id: string, updates: Partial<CanvasImage>) => {
    console.log('updateImageTransform:', id, updates) // Add this
    setImages(prev =>
      prev.map(img =>
        img.id === id ? { ...img, ...updates } : img
      )
    )
  }, [])

  return {
    images,
    draggingId,
    containerRef,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    updateImagePosition,
    updateImageTransform
  }
}
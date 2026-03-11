import { useState, useRef, useCallback, useEffect } from "react"
import { FederatedPointerEvent, Container } from "pixi.js"
import type { CanvasImage } from "../types/CanvasImage"

type DragOffset = {
  x: number
  y: number
}

export function useDraggableSprites(initialImages: CanvasImage[]) {
  const [images, setImages] = useState<CanvasImage[]>(initialImages)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragOffset = useRef<DragOffset>({ x: 0, y: 0 })
  const containerRef = useRef<Container>(null)

  // Update images when props change, but preserve dragged positions
  useEffect(() => {
    if (!draggingId) {
      // Only add new images, don't remove existing ones
      setImages(prev => {
        const newImages = initialImages.filter(
          newImg => !prev.some(existingImg => existingImg.id === newImg.id)
        )
        return [...prev, ...newImages]
      })
    }
  }, [initialImages, draggingId])

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
    // Here you could emit the final position to parent
    // onImageMoved?.(images.find(img => img.id === id))
  }, [])

  const updateImagePosition = useCallback((id: string, x: number, y: number) => {
    setImages(prev =>
      prev.map(img =>
        img.id === id ? { ...img, x, y } : img
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
    updateImagePosition
  }
}
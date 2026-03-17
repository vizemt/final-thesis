import { useState, useRef, useCallback, useEffect } from "react"
import * as PIXI from 'pixi.js'
import type { CanvasImage } from "../types/CanvasImage"

export function useDraggableSprites(initialImages: CanvasImage[]) {
  const [images, setImages] = useState<CanvasImage[]>(initialImages)
  const containerRef = useRef<PIXI.Container>(null)

  // Update images when props change
  useEffect(() => {
    console.log('useDraggableSprites received new images:', initialImages)
    setImages(initialImages)
  }, [initialImages])

  const updateImageTransform = useCallback((id: string, updates: Partial<CanvasImage>) => {
    console.log('updateImageTransform called:', id, updates)
    setImages(prev => {
      const newImages = prev.map(img =>
        img.id === id ? { ...img, ...updates } : img
      )
      console.log('Updated images:', newImages)
      return newImages
    })
  }, [])

  return {
    images,
    containerRef,
    updateImageTransform
  }
}
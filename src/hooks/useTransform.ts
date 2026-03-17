import { useState, useCallback, useRef } from 'react'
import type { CanvasImage } from '../types/CanvasImage'

interface TransformState {
  id: string
  type: 'move' | 'resize' | 'rotate'
  handle: string
  startX: number
  startY: number
  startData: {
    x: number
    y: number
    scaleX: number
    scaleY: number
    rotation: number
    originalWidth: number
    originalHeight: number
  }
}

export function useTransform(
  images: CanvasImage[], 
  onTransform: (id: string, updates: Partial<CanvasImage>) => void
) {
  const [activeTransform, setActiveTransform] = useState<TransformState | null>(null)
  const transformRef = useRef<TransformState | null>(null)

  const startTransform = useCallback((
    id: string,
    type: 'move' | 'resize' | 'rotate',
    event: any,
    handle: string = ''
  ) => {
    console.log('Start transform:', { id, type, handle })
    const image = images.find(img => img.id === id)
    if (!image) {
      return
    }

    const startData = {
      x: image.x,
      y: image.y,
      scaleX: image.scale?.x || 1,
      scaleY: image.scale?.y || 1,
      rotation: image.rotation || 0,
      originalWidth: image.originalWidth || 100,
      originalHeight: image.originalHeight || 100
    }

    const transform = {
      id,
      type,
      handle,
      startX: event.global.x,
      startY: event.global.y,
      startData
    }

    console.log('Transform started:', transform)
    setActiveTransform(transform)
    transformRef.current = transform
  }, [images])

  const updateTransform = useCallback((event: any) => {
    const transform = transformRef.current
    if (!transform) {
      return
    }

    const deltaX = event.global.x - transform.startX
    const deltaY = event.global.y - transform.startY

    let updates: Partial<CanvasImage> = {}

    switch (transform.type) {
      case 'move':
        updates = {
          x: transform.startData.x + deltaX,
          y: transform.startData.y + deltaY
        }
        console.log('Move update:', updates)
        break

      case 'rotate':
        const rotationDelta = (deltaX + deltaY) * 0.005
        updates = {
          rotation: transform.startData.rotation + rotationDelta
        }
        console.log('Rotate update:', updates)
        break

      case 'resize':
        let scaleX = transform.startData.scaleX
        let scaleY = transform.startData.scaleY
        const scaleFactor = 0.0009

        switch (transform.handle) { // todo handle direction change?
          case 'top-left':
            scaleX = Math.max(0.1, transform.startData.scaleX - deltaX * scaleFactor)
            scaleY = Math.max(0.1, transform.startData.scaleY - deltaY * scaleFactor)
            break
          case 'top-right':
            scaleX = Math.max(0.1, transform.startData.scaleX + deltaX * scaleFactor)
            scaleY = Math.max(0.1, transform.startData.scaleY - deltaY * scaleFactor)
            break
          case 'bottom-left':
            scaleX = Math.max(0.1, transform.startData.scaleX - deltaX * scaleFactor)
            scaleY = Math.max(0.1, transform.startData.scaleY + deltaY * scaleFactor)
            break
          case 'bottom-right':
            scaleX = Math.max(0.1, transform.startData.scaleX + deltaX * scaleFactor)
            scaleY = Math.max(0.1, transform.startData.scaleY + deltaY * scaleFactor)
            break
          case 'top':
            scaleY = Math.max(0.1, transform.startData.scaleY - deltaY * scaleFactor)
            break
          case 'bottom':
            scaleY = Math.max(0.1, transform.startData.scaleY + deltaY * scaleFactor)
            break
          case 'left':
            scaleX = Math.max(0.1, transform.startData.scaleX - deltaX * scaleFactor)
            break
          case 'right':
            scaleX = Math.max(0.1, transform.startData.scaleX + deltaX * scaleFactor)
            break
        }

        updates = {
          scale: { x: scaleX, y: scaleY }
        }

        console.log(' Resize update:', updates)
        break
    }

    onTransform(transform.id, updates)
  }, [onTransform])

  const endTransform = useCallback(() => {
    console.log(' End transform')
    setActiveTransform(null)
    transformRef.current = null
  }, [])

  return {
    activeTransform,
    startTransform,
    updateTransform,
    endTransform
  }
}
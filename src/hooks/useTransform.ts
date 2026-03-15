import { useState, useCallback, useRef } from 'react'
import { FederatedPointerEvent } from 'pixi.js'
import type { CanvasImage } from '../types/CanvasImage'
import type { TransformHandle } from '../types/Transform'

interface TransformState {
  id: string
  type: 'move' | 'resize' | 'rotate'
  handle?: TransformHandle
  startX: number
  startY: number
  startData: {
    x: number
    y: number
    originalWidth: number
    originalHeight: number
    scaleX: number
    scaleY: number
    rotation: number
  }
}

export function useTransform(images: CanvasImage[], onTransform: (id: string, updates: Partial<CanvasImage>) => void) {
  const [activeTransform, setActiveTransform] = useState<TransformState | null>(null)
  const transformRef = useRef<TransformState | null>(null)

  const startTransform = useCallback((
    id: string,
    type: 'move' | 'resize' | 'rotate',
    event: FederatedPointerEvent,
    handle?: TransformHandle
  ) => {
    const image = images.find(img => img.id === id)
    if (!image) return

    const startData = {
      x: image.x,
      y: image.y,
      originalWidth: image.originalWidth || 100,
      originalHeight: image.originalHeight || 100,
      scaleX: image.scale?.x || 1,
      scaleY: image.scale?.y || 1,
      rotation: image.rotation || 0
    }

    const transform = {
      id,
      type,
      handle,
      startX: event.global.x,
      startY: event.global.y,
      startData
    }

    console.log('Start transform:', transform)
    setActiveTransform(transform)
    transformRef.current = transform
  }, [images])

  const updateTransform = useCallback((event: FederatedPointerEvent) => {
    const transform = transformRef.current
    if (!transform) return

    const deltaX = event.global.x - transform.startX
    const deltaY = event.global.y - transform.startY

    console.log('Transform active:', transform.type, deltaX, deltaY)

    let updates: Partial<CanvasImage> = {}

    switch (transform.type) {
      case 'move':
        updates = {
          x: transform.startData.x + deltaX,
          y: transform.startData.y + deltaY
        }
        break

      case 'rotate':
        const rotationDelta = (deltaX + deltaY) * 0.01
        updates = {
          rotation: transform.startData.rotation + rotationDelta
        }
        break

      case 'resize':
        console.log('Resizing with handle:', transform.handle)
        if (transform.handle) {
          let scaleX = transform.startData.scaleX
          let scaleY = transform.startData.scaleY
          
          // Scale factor
          const scaleFactor = 0.001
          
          // For each handle, moving toward the center should DECREASE scale
          // Moving away from center should INCREASE scale
          switch (transform.handle) {
            // Top-left: moving toward bottom-right (positive delta) increases scale
            case 'top-left':
              scaleX = Math.max(0.1, transform.startData.scaleX + deltaX * scaleFactor)
              scaleY = Math.max(0.1, transform.startData.scaleY + deltaY * scaleFactor)
              break
              
            // Top-right: moving toward bottom-left (negative deltaX, positive deltaY)
            // Negative deltaX should decrease scale, so we subtract it (double negative = positive)
            case 'top-right':
              scaleX = Math.max(0.1, transform.startData.scaleX - deltaX * scaleFactor)
              scaleY = Math.max(0.1, transform.startData.scaleY + deltaY * scaleFactor)
              break
              
            // Bottom-left: moving toward top-right (positive deltaX, negative deltaY)
            // Negative deltaY should decrease scale, so we subtract it
            case 'bottom-left':
              scaleX = Math.max(0.1, transform.startData.scaleX + deltaX * scaleFactor)
              scaleY = Math.max(0.1, transform.startData.scaleY - deltaY * scaleFactor)
              break
              
            // Bottom-right: moving toward top-left (negative delta in both directions)
            case 'bottom-right':
              scaleX = Math.max(0.1, transform.startData.scaleX - deltaX * scaleFactor)
              scaleY = Math.max(0.1, transform.startData.scaleY - deltaY * scaleFactor)
              break
              
            // Top: moving down (positive deltaY) increases scale
            case 'top':
              scaleY = Math.max(0.1, transform.startData.scaleY + deltaY * scaleFactor)
              break
              
            // Bottom: moving up (negative deltaY) decreases scale
            case 'bottom':
              scaleY = Math.max(0.1, transform.startData.scaleY - deltaY * scaleFactor)
              break
              
            // Left: moving right (positive deltaX) increases scale
            case 'left':
              scaleX = Math.max(0.1, transform.startData.scaleX + deltaX * scaleFactor)
              break
              
            // Right: moving left (negative deltaX) decreases scale
            case 'right':
              scaleX = Math.max(0.1, transform.startData.scaleX - deltaX * scaleFactor)
              break
          }

          // Maintain aspect ratio with Shift key
          if (event.shiftKey) {
            // Use the original aspect ratio from startData
            const aspect = transform.startData.scaleX / transform.startData.scaleY
            
            if (transform.handle?.includes('left') || transform.handle?.includes('right')) {
              // Horizontal resize - adjust Y to match aspect
              scaleY = scaleX / aspect
            } else if (transform.handle?.includes('top') || transform.handle?.includes('bottom')) {
              // Vertical resize - adjust X to match aspect
              scaleX = scaleY * aspect
            } else {
              // Corner handles - maintain aspect ratio by using the larger change
              const scaleChangeX = Math.abs(scaleX - transform.startData.scaleX)
              const scaleChangeY = Math.abs(scaleY - transform.startData.scaleY)
              
              if (scaleChangeX > scaleChangeY) {
                scaleY = scaleX / aspect
              } else {
                scaleX = scaleY * aspect
              }
            }
          }

          console.log('New scale:', { scaleX, scaleY })

          updates = {
            scale: { x: scaleX, y: scaleY }
          }

          // Adjust position to keep the opposite corner fixed
          // For left-side handles, adjust X position
          if (transform.handle.includes('left')) {
            updates.x = transform.startData.x + 
              (transform.startData.originalWidth * (transform.startData.scaleX - scaleX)) / 2
          }
          
          // For top-side handles, adjust Y position
          if (transform.handle.includes('top')) {
            updates.y = transform.startData.y + 
              (transform.startData.originalHeight * (transform.startData.scaleY - scaleY)) / 2
          }
        }
        break
    }

    onTransform(transform.id, updates)
  }, [onTransform])

  const endTransform = useCallback(() => {
    console.log('End transform')
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
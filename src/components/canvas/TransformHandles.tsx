import * as PIXI from 'pixi.js'
import { extend } from '@pixi/react'
import { useCallback } from 'react'
import type { CanvasImage } from '../../types/CanvasImage'

extend({
  Graphics: PIXI.Graphics,
  Container: PIXI.Container,
})

interface TransformHandlesProps {
  image: CanvasImage
  onTransformStart: (type: 'resize' | 'rotate', handle: string, event: any) => void
}

const HANDLE_SIZE = 8
const ROTATE_HANDLE_DISTANCE = 30

export function TransformHandles({ image, onTransformStart }: TransformHandlesProps) {
  const width = (image.originalWidth || 100) * (image.scale?.x || 1)
  const height = (image.originalHeight || 100) * (image.scale?.y || 1)
  const rotation = image.rotation || 0

  const handles = [
    // Corner handles
    { type: 'resize', handle: 'top-left', x: -width/2, y: -height/2, cursor: 'nw-resize' },
    { type: 'resize', handle: 'top-right', x: width/2, y: -height/2, cursor: 'ne-resize' },
    { type: 'resize', handle: 'bottom-left', x: -width/2, y: height/2, cursor: 'sw-resize' },
    { type: 'resize', handle: 'bottom-right', x: width/2, y: height/2, cursor: 'se-resize' },
    // Edge handles
    { type: 'resize', handle: 'top', x: 0, y: -height/2, cursor: 'n-resize' },
    { type: 'resize', handle: 'right', x: width/2, y: 0, cursor: 'e-resize' },
    { type: 'resize', handle: 'bottom', x: 0, y: height/2, cursor: 's-resize' },
    { type: 'resize', handle: 'left', x: -width/2, y: 0, cursor: 'w-resize' },
    // Rotate handle
    { type: 'rotate', handle: 'rotate', x: 0, y: -height/2 - ROTATE_HANDLE_DISTANCE, cursor: 'grab' }
  ]

  const drawHandle = useCallback((g: PIXI.Graphics, x: number, y: number, isRotate: boolean) => {
    g.clear()
    if (isRotate) {
      g.circle(x, y, HANDLE_SIZE)
      g.fill({ color: 0x00ff00, alpha: 0.8 })
      g.stroke({ width: 2, color: 0xffffff })
    } else {
      g.rect(x - HANDLE_SIZE/2, y - HANDLE_SIZE/2, HANDLE_SIZE, HANDLE_SIZE)
      g.fill({ color: 0xffffff, alpha: 0.8 })
      g.stroke({ width: 2, color: 0x00aaff })
    }
  }, [])

  const drawBorder = useCallback((g: PIXI.Graphics) => {
    g.clear()
    g.rect(-width/2, -height/2, width, height)
    g.stroke({ width: 2, color: 0x00aaff, alpha: 0.8 })
  }, [width, height])

  const handlePointerDown = (type: string, handle: string, event: any) => {
    console.log('Handle pointer down:', { type, handle })
    event.stopPropagation()
    event.preventDefault()
    onTransformStart(type as 'resize' | 'rotate', handle, event)
  }

  return (
    <pixiContainer
      x={image.x}
      y={image.y}
      rotation={rotation}
      eventMode="static"
      interactive={true}
      zIndex={1000} // Make sure handles are on top
    >
      {/* Selection border*/}
      <pixiGraphics
        eventMode="none"
        interactive={false}
        draw={drawBorder}
      />

      {/* Handles */}
      {handles.map(({ type, handle, x, y, cursor }) => (
        <pixiGraphics
          key={handle}
          eventMode="static"
          interactive={true}
          cursor={cursor}
          x={x}
          y={y}
          zIndex={1001} // Even higher z-index for handles
          onPointerDown={(e) => handlePointerDown(type, handle, e)}
          draw={(g: PIXI.Graphics) => drawHandle(g, 0, 0, type === 'rotate')}
        />
      ))}
    </pixiContainer>
  )
}
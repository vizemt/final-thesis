import { Graphics } from 'pixi.js'
import { extend } from '@pixi/react'
import { useCallback } from 'react'
import type { CanvasImage } from '../../types/CanvasImage'
import type { TransformHandle } from '../../types/Transform'

extend({
  Graphics
})

interface TransformHandlesProps {
  image: CanvasImage
  onTransformStart: (type: 'resize' | 'rotate', handle: TransformHandle, event: any) => void
}

const HANDLE_SIZE = 8
const ROTATE_HANDLE_DISTANCE = 30

export function TransformHandles({ image, onTransformStart }: TransformHandlesProps) {
  const width = image.width || 100
  const height = image.height || 100
  const rotation = image.rotation || 0

  // Corner handles for resizing
  const corners: Array<{ handle: TransformHandle; x: number; y: number }> = [
    { handle: 'top-left', x: -width/2, y: -height/2 },
    { handle: 'top-right', x: width/2, y: -height/2 },
    { handle: 'bottom-left', x: -width/2, y: height/2 },
    { handle: 'bottom-right', x: width/2, y: height/2 }
  ]

  // Edge handles for resizing
  const edges: Array<{ handle: TransformHandle; x: number; y: number }> = [
    { handle: 'top', x: 0, y: -height/2 },
    { handle: 'right', x: width/2, y: 0 },
    { handle: 'bottom', x: 0, y: height/2 },
    { handle: 'left', x: -width/2, y: 0 }
  ]

  const drawHandle = useCallback((g: any, x: number, y: number, isRotate: boolean = false) => {
    g.clear()
    if (isRotate) {
      // Draw circle for rotate handle
      g.circle(x, y, HANDLE_SIZE)
      g.fill({ color: 0x00ff00, alpha: 0.8 })
      g.stroke({ width: 2, color: 0xffffff })
    } else {
      // Draw square for resize handles
      g.rect(x - HANDLE_SIZE/2, y - HANDLE_SIZE/2, HANDLE_SIZE, HANDLE_SIZE)
      g.fill({ color: 0xffffff, alpha: 0.8 })
      g.stroke({ width: 2, color: 0x00aaff })
    }
  }, [])

  const handlePointerDown = useCallback((type: 'resize' | 'rotate', handle: TransformHandle, event: any) => {
    event.stopPropagation()
    console.log('Handle clicked:', type, handle)
    onTransformStart(type, handle, event)
  }, [onTransformStart])

  return (
    <>
      {/* Selection border */}
      <pixiGraphics
        eventMode="none"
        x={image.x}
        y={image.y}
        rotation={rotation}
        draw={(g: any) => {
          g.clear()
          g.rect(-width/2, -height/2, width, height)
          g.stroke({ width: 2, color: 0x00aaff, alpha: 0.8 })
        }}
      />

      {/* Rotate handle */}
      <pixiGraphics
        eventMode="static"
        cursor="grab"
        x={image.x}
        y={image.y - height/2 - ROTATE_HANDLE_DISTANCE}
        rotation={rotation}
        onPointerDown={(e) => handlePointerDown('rotate', 'rotate', e)}
        draw={(g: any) => drawHandle(g, 0, 0, true)}
      />

      {/* Corner resize handles */}
      {corners.map(({ handle, x, y }) => (
        <pixiGraphics
          key={handle}
          eventMode="static"
          cursor={`${handle}-resize`}
          x={image.x + (x * Math.cos(rotation) - y * Math.sin(rotation))}
          y={image.y + (x * Math.sin(rotation) + y * Math.cos(rotation))}
          onPointerDown={(e) => handlePointerDown('resize', handle, e)}
          draw={(g: any) => drawHandle(g, 0, 0)}
        />
      ))}

      {/* Edge resize handles */}
      {edges.map(({ handle, x, y }) => (
        <pixiGraphics
          key={handle}
          eventMode="static"
          cursor={`${handle}-resize`}
          x={image.x + (x * Math.cos(rotation) - y * Math.sin(rotation))}
          y={image.y + (x * Math.sin(rotation) + y * Math.cos(rotation))}
          onPointerDown={(e) => handlePointerDown('resize', handle, e)}
          draw={(g: any) => drawHandle(g, 0, 0)}
        />
      ))}
    </>
  )
}
import { Sprite, FederatedPointerEvent } from "pixi.js"
import { extend, useExtend } from "@pixi/react"
import { useCallback, useRef } from "react"
import { getTexture } from "./textureCache"
import type { CanvasImage } from "../../types/CanvasImage"

extend({
  Sprite,
})

type DraggableSpriteProps = {
  image: CanvasImage
  isDragging: boolean
  onDragStart: (id: string, event: FederatedPointerEvent) => void
  onDragMove: (id: string, event: FederatedPointerEvent) => void
  onDragEnd: (id: string, event: FederatedPointerEvent) => void
}

export function DraggableSprite({ 
  image, 
  isDragging, 
  onDragStart, 
  onDragMove, 
  onDragEnd 
}: DraggableSpriteProps) {
  
  const handleDragStart = useCallback((event: FederatedPointerEvent) => {
    event.stopPropagation()
    onDragStart(image.id, event)
  }, [image.id, onDragStart])

  const handleDragMove = useCallback((event: FederatedPointerEvent) => {
    event.stopPropagation()
    onDragMove(image.id, event)
  }, [image.id, onDragMove])

  const handleDragEnd = useCallback((event: FederatedPointerEvent) => {
    event.stopPropagation()
    onDragEnd(image.id, event)
  }, [image.id, onDragEnd])

  return (
    <pixiSprite
      texture={getTexture(image.texture)}
      x={image.x}
      y={image.y}
      eventMode="static"
      cursor="move"
      alpha={isDragging ? 0.7 : 1}
      anchor={0.5}
      onPointerDown={handleDragStart}
      onGlobalPointerMove={handleDragMove}
      onPointerUp={handleDragEnd}
      onPointerUpOutside={handleDragEnd}
    />
  )
}
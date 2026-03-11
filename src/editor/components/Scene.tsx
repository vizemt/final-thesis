import { Container } from "pixi.js"
import { extend } from "@pixi/react"
import { DraggableSprite } from "./DraggableSprite"
import type { CanvasImage } from "../../types/CanvasImage"

extend({
  Container,
})

type SceneProps = {
  images: CanvasImage[]
  draggingId: string | null
  containerRef: React.RefObject<Container>
  onDragStart: (id: string, event: any) => void
  onDragMove: (id: string, event: any) => void
  onDragEnd: (id: string, event: any) => void
}

export function Scene({ 
  images, 
  draggingId, 
  containerRef, 
  onDragStart, 
  onDragMove, 
  onDragEnd 
}: SceneProps) {
  return (
    <pixiContainer ref={containerRef}>
      {images.map(img => (
        <DraggableSprite
          key={img.id}
          image={img}
          isDragging={draggingId === img.id}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
        />
      ))}
    </pixiContainer>
  )
}
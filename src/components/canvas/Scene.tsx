import { Container } from "pixi.js"
import { extend } from "@pixi/react"
import { SelectedSprite } from "./SelectedSprite"
import type { CanvasImage } from "../../types/CanvasImage"

extend({
  Container,
})

type SceneProps = {
  images: CanvasImage[]
  draggingId: string | null
  selectedId: string | null
  multiSelectedIds: Set<string>
  containerRef: React.RefObject<Container>
  onDragStart: (id: string, event: any) => void
  onTransformStart: (id: string, type: 'resize' | 'rotate', handle: any, event: any) => void
  onSelect: (id: string, multi: boolean) => void
}

export function Scene({ 
  images, 
  draggingId,
  selectedId,
  multiSelectedIds,
  containerRef, 
  onDragStart, 
  onTransformStart,
  onSelect
}: SceneProps) {
  const handleBackgroundClick = (event: any) => {
    // Deselect when clicking on empty background
    if (event.target === event.currentTarget) {
      onSelect('', false)
    }
  }

  return (
    <pixiContainer 
      ref={containerRef}
      eventMode="static"
      onPointerDown={handleBackgroundClick}
    >
      {images.map(img => (
        <SelectedSprite
          key={img.id}
          image={img}
          isSelected={selectedId === img.id || multiSelectedIds.has(img.id)}
          onDragStart={onDragStart}
          onTransformStart={(type, handle, event) => 
            onTransformStart(img.id, type, handle, event)
          }
        />
      ))}
    </pixiContainer>
  )
}
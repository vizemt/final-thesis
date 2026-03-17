import * as PIXI from 'pixi.js'
import { extend } from "@pixi/react"
import { SelectedSprite } from "./SelectedSprite"
import type { CanvasImage } from "../../types/CanvasImage"

extend({
  Container: PIXI.Container,
})

type SceneProps = {
  images: CanvasImage[]
  containerRef: React.RefObject<PIXI.Container>
  selectedId: string | null
  multiSelectedIds: Set<string>
  onDragStart: (id: string, event: any) => void
  onTransformStart: (id: string, type: 'resize' | 'rotate', handle: string, event: any) => void
  onSelect: (id: string, multi: boolean) => void
}

export function Scene({ 
  images, 
  containerRef, 
  selectedId,
  multiSelectedIds,
  onDragStart,
  onTransformStart,
  onSelect
}: SceneProps) {
  const handleBackgroundClick = (event: any) => {
    console.log('Background click')
    // Only deselect if clicking directly on the background container
    if (event.target === event.currentTarget) {
      onSelect('', false)
    }
  }

  return (
    <pixiContainer 
      ref={containerRef}
      eventMode="static"
      interactive={true}
      onPointerDown={handleBackgroundClick}
    >
      {images.map(img => (
        <SelectedSprite
          key={img.id}
          image={img}
          isSelected={selectedId === img.id || multiSelectedIds.has(img.id)}
          onDragStart={onDragStart}
          onTransformStart={onTransformStart}
          onSelect={onSelect}
        />
      ))}
    </pixiContainer>
  )
}
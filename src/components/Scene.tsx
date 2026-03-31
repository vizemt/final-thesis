import * as PIXI from 'pixi.js'
import { extend } from "@pixi/react"
import type { CanvasImage } from "../types/CanvasImage"
import { ImageSprite } from './ImageSprite'

extend({
  Container: PIXI.Container,
})

type SceneProps = {
  images: CanvasImage[]
  containerRef: React.RefObject<PIXI.Container>
  selectedId: string | null
  multiSelectedIds: Set<string>
  onSelect: (id: string, multi: boolean) => void
}

export function Scene({ 
  images, 
  containerRef, 
  selectedId,
  multiSelectedIds,
  onSelect
}: SceneProps) {


  return (
    <pixiContainer 
      ref={containerRef}
      eventMode="static"
      interactive={true}
    >
      {images.map(img => (
        <ImageSprite
          key={img.id}
          zIndex={img.layer.zIndex}
          image={img}
          isSelected={selectedId === img.id || multiSelectedIds.has(img.id)}
          onSelect={onSelect}
        />
      ))}
    </pixiContainer>
  )
}
import * as PIXI from 'pixi.js'
import { extend } from "@pixi/react"
import type { CanvasImage } from "../types/CanvasImage"
import { ImageSprite } from './ImageSprite'
import type { GraphicsItem } from '../types/GraphicsItem'

extend({
  Container: PIXI.Container,
})

type PageSceneProps = {
  images: (CanvasImage | GraphicsItem)[]
  canvasX: number
  canvasY: number
  containerRef: React.RefObject<PIXI.Container>
  selectedId: string | null
  multiSelectedIds: Set<string>
  onSelect: (id: string, multi: boolean) => void
  onImageDelete: (id: string) => void
  onImageUpdate: (imageId: string, updates: CanvasImage) => void
}

export function PageScene({ 
  images, 
  canvasX,
  canvasY,
  containerRef, 
  selectedId,
  multiSelectedIds,
  onSelect,
  onImageDelete,
  onImageUpdate
}: PageSceneProps) {

  // Filter by type using a type guard
  const isCanvasImage = (img: CanvasImage | GraphicsItem): img is CanvasImage => {
    return 'texture' in img || 'imageUrl' in img;
  };

  const isGraphicsItem = (img: CanvasImage | GraphicsItem): img is GraphicsItem => {
    return 'path' in img || 'commands' in img;
  };

  return (
    <pixiContainer 
      ref={containerRef}
      eventMode="static"
      interactive={true}
      sortableChildren={true}
    >

      {images.filter(isCanvasImage).map(img => (
        <ImageSprite
          key={img.id}
          zIndex={img.layer.zIndex}
          image={img}
          canvasX={canvasX}
          canvasY={canvasY}
          isSelected={selectedId === img.id || multiSelectedIds.has(img.id)}
          onSelect={onSelect}
          onDelete={onImageDelete}
          onUpdate={onImageUpdate}
        />
      ))}
    </pixiContainer>
  )
}
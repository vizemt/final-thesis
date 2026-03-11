import { Application, extend } from "@pixi/react"
import { Container } from "pixi.js"
import { Scene } from "./Scene"
import { useDraggableSprites } from "../../hooks/useDraggableSprites"
import type { CanvasImage } from "../../types/CanvasImage"

extend({
  Container,
})

type CanvasProps = {
  images: CanvasImage[]
  onImageMoved?: (image: CanvasImage) => void
}

export default function Canvas({ images, onImageMoved }: CanvasProps) {
  const {
    images: localImages,
    draggingId,
    containerRef,
    handleDragStart,
    handleDragMove,
    handleDragEnd
  } = useDraggableSprites(images)

  // Optional: Notify parent of position changes
  const handleDragEndWithCallback = (id: string, event: any) => {
    handleDragEnd(id, event)
    const movedImage = localImages.find(img => img.id === id)
    if (movedImage && onImageMoved) {
      onImageMoved(movedImage)
    }
  }

  return (
    <Application 
      width={1600} 
      height={600} 
      background={0x1000ff}
      sharedTicker={true}
    >
      <Scene
        images={localImages}
        draggingId={draggingId}
        containerRef={containerRef}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEndWithCallback}
      />
    </Application>
  )
}
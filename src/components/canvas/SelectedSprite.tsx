import { Sprite } from 'pixi.js'
import { extend } from '@pixi/react'
import { TransformHandles } from './TransformHandles'
import { getTexture, getTextureDimensions } from '../textureCache'
import type { CanvasImage } from '../../types/CanvasImage'

extend({
  Sprite
})

interface SelectedSpriteProps {
  image: CanvasImage
  isSelected: boolean
  onDragStart: (id: string, event: any) => void
  onTransformStart: (type: 'resize' | 'rotate', handle: any, event: any) => void
}

export function SelectedSprite({ 
  image, 
  isSelected, 
  onDragStart, 
  onTransformStart 
}: SelectedSpriteProps) {
  console.log('Rendering SelectedSprite:', image.id, 'scale:', image.scale) // Add this
  
  // Get original dimensions
  const dimensions = getTextureDimensions(image.texture)
  
  // Use stored dimensions or calculate from texture
  const originalWidth = image.originalWidth || dimensions.width || 100
  const originalHeight = image.originalHeight || dimensions.height || 100
  
  // Use scale for sizing
  const scale = image.scale || { x: 1, y: 1 }
  
  const rotation = image.rotation || 0

  return (
    <>
      {/* The actual sprite - using scale for sizing */}
      <pixiSprite
        texture={getTexture(image.texture)}
        x={image.x}
        y={image.y}
        scale={scale}  // This should update when scale changes
        rotation={rotation}
        anchor={0.5}
        eventMode="static"
        cursor="move"
        onPointerDown={(e) => onDragStart(image.id, e)}
      />

      {/* Transform handles (only shown when selected) */}
      {isSelected && (
        <TransformHandles
          image={{
            ...image,
            width: originalWidth * scale.x,
            height: originalHeight * scale.y
          }}
          onTransformStart={onTransformStart}
        />
      )}
    </>
  )
}
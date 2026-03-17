import * as PIXI from 'pixi.js'
import { extend } from '@pixi/react'
import { TransformHandles } from './TransformHandles'
import { getTexture } from '../textureCache'
import type { CanvasImage } from '../../types/CanvasImage'

extend({
  Sprite: PIXI.Sprite,
})

interface SelectedSpriteProps {
  image: CanvasImage
  isSelected: boolean
  onDragStart: (id: string, event: any) => void
  onTransformStart: (id: string, type: 'resize' | 'rotate', handle: string, event: any) => void
  onSelect: (id: string, multi: boolean) => void
}

export function SelectedSprite({ 
  image, 
  isSelected, 
  onDragStart, 
  onTransformStart,
  onSelect
}: SelectedSpriteProps) {
  console.log('Rendering SelectedSprite:', image.id, image)

  const scale = image.scale || { x: 1, y: 1 }
  const rotation = image.rotation || 0

  const handleSpritePointerDown = (e: any) => {
    console.log('Sprite pointer down:', image.id)
    e.stopPropagation()
    
    // Handle selection first
    onSelect(image.id, e.shiftKey)
    
    // Then start drag
    onDragStart(image.id, e)
  }

  return (
    <>
      <pixiSprite
        texture={getTexture(image.texture)}
        x={image.x}
        y={image.y}
        scale={scale}
        rotation={rotation}
        anchor={0.5}
        eventMode="static"
        interactive={true}
        cursor="move"
        onPointerDown={handleSpritePointerDown}
      />

      {isSelected && (
        <TransformHandles
          image={image}
          onTransformStart={(type, handle, e) => {
            console.log('Transform handle pointer down:', { type, handle })
            e.stopPropagation()
            e.preventDefault()
            onTransformStart(image.id, type, handle, e)
          }}
        />
      )}
    </>
  )
}

export default SelectedSprite
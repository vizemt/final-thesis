// components/canvas/Canvas.tsx
import { Application, extend, useApplication } from "@pixi/react"
import * as PIXI from 'pixi.js'
import { useEffect } from "react"
import { Scene } from "./Scene"
import { useDraggableSprites } from "../../hooks/useDraggableSprites"
import { useSelection } from "../../hooks/useSelection"
import { useTransform } from "../../hooks/useTransform"
import { useLayers } from "../../hooks/useLayers"
import { LayerPanel } from "../../ui/LayerPanel"
import type { CanvasImage } from "../../types/CanvasImage"

extend({
  Container: PIXI.Container,
})

// Component that handles global events
function GlobalEventLayer({ 
  activeTransform,
  updateTransform,
  endTransform
}: { 
  activeTransform: any
  updateTransform: (event: any) => void
  endTransform: () => void
}) {
  const { app } = useApplication()
  
  useEffect(() => {
    if (!app) return
    
    const stage = app.stage
    stage.eventMode = 'static'
    
    const handleGlobalPointerMove = (event: any) => {
      if (activeTransform) {
        updateTransform(event)
      }
    }
    
    const handleGlobalPointerUp = () => {
      if (activeTransform) {
        endTransform()
      }
    }
    
    stage.on('pointermove', handleGlobalPointerMove)
    stage.on('pointerup', handleGlobalPointerUp)
    stage.on('pointerupoutside', handleGlobalPointerUp)
    
    return () => {
      stage.off('pointermove', handleGlobalPointerMove)
      stage.off('pointerup', handleGlobalPointerUp)
      stage.off('pointerupoutside', handleGlobalPointerUp)
    }
  }, [app, activeTransform, updateTransform, endTransform])
  
  return null
}

type CanvasProps = {
  images: CanvasImage[]
  onImageMoved?: (image: CanvasImage) => void
  onImageTransformed?: (image: CanvasImage) => void
}

export default function Canvas({ images, onImageMoved, onImageTransformed }: CanvasProps) {
  console.log('Canvas received images:', images)

  const {
    images: localImages,
    containerRef,
    updateImageTransform
  } = useDraggableSprites(images)

  const {
    layers,
    activeLayerId,
    addLayer,
    removeLayer,
    updateLayer,
    moveLayer,
    setActiveLayerId
  } = useLayers(images)

  const {
    selectedId,
    multiSelectedIds,
    select,
    isSelected
  } = useSelection()

  const handleTransform = (id: string, updates: Partial<CanvasImage>) => {
    console.log('handleTransform called:', id, updates)
    
    updateImageTransform(id, updates)
    
    if (onImageTransformed) {
      const updatedImage = localImages.find(img => img.id === id)
      if (updatedImage) {
        const transformedImage = { ...updatedImage, ...updates }
        onImageTransformed(transformedImage)
      }
    }
  }

  const {
    startTransform,
    updateTransform,
    endTransform,
    activeTransform
  } = useTransform(localImages, handleTransform)

  const handleDragStart = (id: string, event: any) => {
    console.log('Drag start:', id)
    startTransform(id, 'move', event)
  }

  const handleTransformStart = (id: string, type: 'resize' | 'rotate', handle: string, event: any) => {
    console.log('Transform start:', { id, type, handle })
    startTransform(id, type, event, handle)
  }

  return (
    <div className="canvas-container">
      <Application 
        width={1600} 
        height={900} 
        background={0x999999}
        sharedTicker={true}
      >
        <GlobalEventLayer
          activeTransform={activeTransform}
          updateTransform={updateTransform}
          endTransform={endTransform}
        />
        <Scene
          images={localImages}
          selectedId={selectedId}
          multiSelectedIds={multiSelectedIds}
          containerRef={containerRef}
          onDragStart={handleDragStart}
          onTransformStart={handleTransformStart}
          onSelect={select}
        />
      </Application>

      <LayerPanel
        layers={layers}
        activeLayerId={activeLayerId}
        onSelectLayer={setActiveLayerId}
        onToggleVisibility={(id) => updateLayer(id, { visible: !layers.find(l => l.id === id)?.visible })}
        onToggleLock={(id) => updateLayer(id, { locked: !layers.find(l => l.id === id)?.locked })}
        onRemoveLayer={removeLayer}
        onMoveLayer={moveLayer}
        onOpacityChange={(id, opacity) => updateLayer(id, { opacity })}
        onAddLayer={() => addLayer(`Layer ${layers.length + 1}`)}
      />
    </div>
  )
}
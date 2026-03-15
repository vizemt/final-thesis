import { Application, extend, useApplication } from "@pixi/react" // Keep useApplication
import { Container, RenderLayer } from "pixi.js"
import { useEffect, useRef } from "react"
import { Scene } from "./Scene"
import { useDraggableSprites } from "../../hooks/useDraggableSprites"
import { useSelection } from "../../hooks/useSelection"
import { useTransform } from "../../hooks/useTransform"
import type { CanvasImage } from "../../types/CanvasImage"
import { useLayers } from "../../hooks/useLayers"
import { LayerPanel } from "../../ui/LayerPanel"

extend({
  Container,
  RenderLayer,
})

type CanvasProps = {
  images: CanvasImage[]
  onImageMoved?: (image: CanvasImage) => void
  onImageTransformed?: (image: CanvasImage) => void
}

// Component that handles global events using useApplication()
function GlobalEventLayer({ 
  activeTransform,
  updateTransform,
  endTransform
}: { 
  activeTransform: any
  updateTransform: (event: any) => void
  endTransform: () => void
}) {
  const { app } = useApplication() // Destructure app from the returned object
  
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

export default function Canvas({ images, onImageMoved, onImageTransformed }: CanvasProps) {
  const {
    images: localImages,
    draggingId,
    containerRef,
    updateImagePosition,
    updateImageTransform
  } = useDraggableSprites(images)

  const {
    layers,
    activeLayerId,
    imagesByLayer,
    addLayer,
    removeLayer,
    updateLayer,
    moveLayer,
    assignToLayer,
    setActiveLayerId
  } = useLayers(images)

  const layerContainersRef = useRef<Map<string, Container>>(new Map())

  // Create Pixi layers when layers change
  useEffect(() => {
    // This will be implemented when we set up the Pixi layer system
  }, [layers])

  const {
    selectedId,
    multiSelectedIds,
    select,
    isSelected
  } = useSelection()

  const handleTransform = (id: string, updates: Partial<CanvasImage>) => {
    console.log('handleTransform called with:', id, updates) // Add this
    
    // Use the new updateImageTransform function
    updateImageTransform(id, updates)
    
    if (onImageTransformed) {
      const updatedImage = localImages.find(img => img.id === id)
      if (updatedImage) {
        onImageTransformed({ ...updatedImage, ...updates })
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
    if (event.shiftKey) {
      select(id, true)
    } else if (!isSelected(id)) {
      select(id, false)
    }
    startTransform(id, 'move', event)
  }

  const handleTransformStart = (id: string, type: 'resize' | 'rotate', handle: any, event: any) => {
    if (!isSelected(id)) {
      select(id, false)
    }
    startTransform(id, type, event, handle)
  }

  return (
    <div className="canvas-container">
      <Application 
        width={1700} 
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
          draggingId={draggingId}
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
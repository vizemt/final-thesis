/* Works as controller bridge between ui and canvas and inits PIXI Application (root container) */
import { useCallback, useEffect, useState } from "react"
import Workspace from "./components/Workspace"
import LibraryPanel from "./ui/LibraryPanel"
import type { LibraryImage } from "./types/LibraryImage"
import type { CanvasImage } from "./types/CanvasImage"
import { LayerPanel } from "./ui/LayerPanel"
import { useLayers } from "./hooks/useLayers"
import { useSelection } from "./hooks/useSelection"

export default function App() {
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([])
  const [canvasImages, setCanvasImages] = useState<CanvasImage[]>([])

  const handleUpload = (files: File[]) => {
    const newImages = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file)
    }))

    setLibraryImages(prev => [...prev, ...newImages])
  }

  const {
    selectedId,
    multiSelectedIds,
    select,
    clearSelection,
  } = useSelection()

  const {
    layers,
    activeLayerId,
    addLayer,
    removeLayer,
    updateLayer,
    moveLayer,
    setActiveLayerId
  } = useLayers(canvasImages)

  // When an image is selected, select its layer
  useEffect(() => {
    if (selectedId) {
      const selectedImage = canvasImages.find(img => img.id === selectedId)
      if (selectedImage && selectedImage.layer?.id !== activeLayerId) {
        setActiveLayerId(selectedImage.layer.id)
      }
    } else if (multiSelectedIds.size > 0) {
      // const firstSelectedId = Array.from(multiSelectedIds)[0]
      // const firstSelectedImage = canvasImages.find(img => img.id === firstSelectedId)
      // if (firstSelectedImage && firstSelectedImage.layer?.id !== activeLayerId) {
      //   setActiveLayerId(firstSelectedImage.layer.id)
      // }
    }
  }, [selectedId, multiSelectedIds, canvasImages, activeLayerId, setActiveLayerId])

  // Sync: When layer is selected, select all images in that layer
  const handleSelectLayer = (layerId: string) => {
    setActiveLayerId(layerId)
    
    // Find all images in this layer
    const imagesInLayer = canvasImages.filter(img => img.layer?.id === layerId)
    
    if (imagesInLayer.length === 1) {
      // Single image - select it
      select(imagesInLayer[0].id, false)
    } else if (imagesInLayer.length > 1) {
      // Multiple images - select them all
      clearSelection() // Clear existing selection
      imagesInLayer.forEach(img => {
        select(img.id, true) // Multi-select each image
      })
    } else {
      // No images in layer - clear selection
      clearSelection()
    }
  }

  const addImageToCanvas = async (img: LibraryImage) => {
    const dimensions = await getImageDimensions(img.preview)

    const newLayer = addLayer()
    
    const newCanvasImage: CanvasImage = {
      id: crypto.randomUUID(),
      texture: img.preview,
      x: 200,
      y: 200,
      originalWidth: dimensions.width,
      originalHeight: dimensions.height,
      scale: { x: 1, y: 1 },
      rotation: 0,
      layer: newLayer
    }

    setCanvasImages(prev => [...prev, newCanvasImage])
  }

    // Update image zIndex when layer zIndex changes
  const updateImagesLayerZIndex = useCallback((layerId: string, newZIndex: number) => {
    setCanvasImages(prev => 
      prev.map(img => 
        img.layer?.id === layerId 
          ? { ...img, layer: { ...img.layer, zIndex: newZIndex } }
          : img
      )
    )
  }, [])

  // Listen to layer changes and update corresponding images
  useEffect(() => {
    // This effect runs whenever layers change
    layers.forEach(layer => {
      // Find all images in this layer and ensure they have the correct zIndex
      setCanvasImages(prev => {
        let needsUpdate = false
        const updatedImages = prev.map(img => {
          if (img.layer?.id === layer.id && img.layer.zIndex !== layer.zIndex) {
            needsUpdate = true
            return { ...img, layer: { ...img.layer, zIndex: layer.zIndex } }
          }
          return img
        })
        return needsUpdate ? updatedImages : prev
      })
    })
  }, [layers])

  // Custom moveLayer function that also updates images
  const handleMoveLayer = useCallback((layerId: string, direction: 'up' | 'down') => {
    // Store old zIndex values before moving
    const oldLayers = [...layers]
    
    // Perform the move
    moveLayer(layerId, direction)
    
    // After move, the layers state will update and the useEffect above will sync images
    // We need to know which layers were swapped to update images immediately
    const movedLayer = layers.find(l => l.id === layerId)
    if (movedLayer) {
      updateImagesLayerZIndex(layerId, movedLayer.zIndex)
      
      // Find which layer was swapped with
      const oldLayer = oldLayers.find(l => l.id === layerId)
      const swappedLayer = layers.find(l => 
        l.id !== layerId && 
        oldLayers.find(old => old.id === l.id)?.zIndex !== l.zIndex
      )
      
      if (swappedLayer) {
        updateImagesLayerZIndex(swappedLayer.id, swappedLayer.zIndex)
      }
    }
  }, [layers, moveLayer, updateImagesLayerZIndex])

  // When an image is deleted, handle selection cleanup
  const handleImageDelete = (imageId: string) => {
    setCanvasImages(prev => prev.filter(img => img.id !== imageId))
    if (selectedId === imageId) {
      clearSelection()
    } else if (multiSelectedIds.has(imageId)) {
      const newMultiSelected = new Set(multiSelectedIds)
      newMultiSelected.delete(imageId)
      // Update selection state if needed
      select(Array.from(newMultiSelected)[0] || '', false)
    }
  }

  const cleanupEmptyLayers = useCallback(() => {
    // Count images per layer
    const imageCountByLayer = new Map<string, number>()
    canvasImages.forEach(img => {
      const layerId = img.layer?.id
      if (layerId) {
        imageCountByLayer.set(layerId, (imageCountByLayer.get(layerId) || 0) + 1)
      }
    })

    // Find layers with no images (excluding default layer)
    const emptyLayers = layers.filter(layer => 
      layer.id !== 'default' && 
      !imageCountByLayer.has(layer.id)
    )

    // Remove empty layers
    emptyLayers.forEach(layer => {
      removeLayer(layer.id)
    })

    // If active layer was removed, switch to default layer
    if (emptyLayers.some(layer => layer.id === activeLayerId)) {
      setActiveLayerId('default')
    }
  }, [canvasImages, layers, removeLayer, activeLayerId, setActiveLayerId])

   // Run cleanup whenever images change
  useEffect(() => {
    cleanupEmptyLayers()
  }, [cleanupEmptyLayers])

  return (
    <div className="editor">
      <LibraryPanel
        images={libraryImages}
        onUpload={handleUpload}
        onSelect={addImageToCanvas}
      />
      <LayerPanel
        layers={layers}
        activeLayerId={activeLayerId}
        onSelectLayer={handleSelectLayer}
        onToggleVisibility={(id) => updateLayer(id, { visible: !layers.find(l => l.id === id)?.visible })}
        onToggleLock={(id) => updateLayer(id, { locked: !layers.find(l => l.id === id)?.locked })}
        onRemoveLayer={(id) => {
          // clear images
          setCanvasImages(prev => prev.filter(img => img.layer?.id !== id))
          removeLayer(id)
          // clear selection if the deleted layer was selected
          if (activeLayerId === id) {
            clearSelection()
          }
        }}
        onMoveLayer={handleMoveLayer}
        onOpacityChange={(id, opacity) => updateLayer(id, { opacity })}
      />
      <Workspace 
        images={canvasImages}
        selectedId={selectedId}
        multiSelectedIds={multiSelectedIds}
        onSelect={select}
        onImageDelete={handleImageDelete}
      />
    </div>
  )
}

// Helper function to get image dimensions
function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.src = src
  })
}
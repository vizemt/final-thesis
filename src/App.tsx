/* Works as controller bridge between ui and canvas and inits PIXI Application (root container) */
import { useCallback, useEffect, useMemo, useState } from "react"
import Workspace from "./components/Workspace"
import LibraryPanel from "./ui/LibraryPanel"
import type { LibraryImage } from "./types/LibraryImage"
import type { CanvasImage } from "./types/CanvasImage"
import { LayerPanel } from "./ui/LayerPanel"
import { useSelection } from "./hooks/useSelection"
import Toolbar from "./ui/Toolbar"
import type { ToolbarItem } from "./types/ToolbarItem"
import PagesPanel from "./ui/PagesPanel"
import type { GraphicsItem } from "./types/GraphicsItem"
import { usePageStore } from "./store/pageStore"
import { getNextZIndex } from "./store/newId"

export default function App() {
  const [activePanel, setActivePanel] = useState<ToolbarItem>('library')
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([])
  
  const [canvasParams, setCanvasParams] = useState({
    width: 1600,
    height: 2400,
    color: 0xffffff,
    cornerRadius: 0,
  })

  // Derive the background GraphicsItem from canvasParams
  const backgroundItem: GraphicsItem = useMemo(() => ({
    id: 'canvas-background',
    type: 'rect',
    x: 0,
    y: 0,
    width: canvasParams.width,
    height: canvasParams.height,
    color: canvasParams.color,
    cornerRadius: canvasParams.cornerRadius,
  }), [canvasParams])

  // Get store actions and state
  const {
    pages,
    activePageId,
    activeLayerId,
    getActivePage,
    setActivePageId,
    addPage,
    renamePage,
    getActivePageLayers,
    deletePage,
    duplicatePage,
    addImageToPage,
    removeImageFromPage,
    updatePageLayers,
    updateImage,
    addLayer,
    removeLayer,
    reorderPages,
    reorderLayers,
    toggleLayerVisibility,
    updateLayerOpacity,
    setActiveLayerId,
    setBackgroundItem
  } = usePageStore()

  const {
    selectedId,
    multiSelectedIds,
    select,
    clearSelection,
  } = useSelection()

  // Subscribe to active page
  const activePage = usePageStore(state => state.getActivePage())
  
  // Subscribe to active page layers
  const activePageLayers = usePageStore(state => state.getActivePageLayers())
  
  // Get current page images - this will update when activePage changes
  const activePageImages = useMemo(() => {   
    return activePage?.images ?? []
  }, [activePage])

  // Initialize background item in store
  useEffect(() => {
    setBackgroundItem(backgroundItem)
  }, [backgroundItem, setBackgroundItem])

  const handleUpload = (files: File[]) => {
    const newImages = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file)
    }))

    setLibraryImages(prev => [...prev, ...newImages])
  }

  // When an image is selected, select its layer
  useEffect(() => {
    if (selectedId) {
      const selectedImage = activePageImages.find(img => img.id === selectedId)
      if (selectedImage && selectedImage.layer?.id !== activeLayerId) {
        setActiveLayerId(selectedImage.layer.id)
      }
    }
  }, [selectedId, activePageImages, activeLayerId, setActiveLayerId])

  // When layer is selected, select all images in that layer
  const handleSelectLayer = (layerId: string) => {
    setActiveLayerId(layerId)
    
    // Find all images in this layer
    const imagesInLayer = activePageImages.filter(img => img.layer?.id === layerId)
    
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
    const newZIndex = getNextZIndex()
    
    // Add new layer for the image
    const newLayer = addLayer({
      name: `Layer ${newZIndex}`,
      visible: true,
      opacity: 1,
      items: [],
      zIndex: newZIndex
    })

    const newCanvasImage: CanvasImage = {
      id: crypto.randomUUID(),
      texture: img.preview,
      originalWidth: dimensions.width,
      originalHeight: dimensions.height,
      scale: { x: 1, y: 1 },
      rotation: 0,
      layer: newLayer
    }

    // Add to active page
    addImageToPage(activePageId, newCanvasImage)
  }

  // When an image is deleted, handle selection cleanup and empty layer removal
  const handleImageDelete = (imageId: string) => {
    const imageToDelete = activePageImages.find(img => img.id === imageId)
    removeImageFromPage(activePageId, imageId)
    
    if (selectedId === imageId) {
      clearSelection()
    } else if (multiSelectedIds.has(imageId)) {
      const newMultiSelected = new Set(multiSelectedIds)
      newMultiSelected.delete(imageId)
      select(Array.from(newMultiSelected)[0] || '', false)
    }

    // Check if the layer is now empty and remove it (if not default)
    if (imageToDelete && imageToDelete.layer?.id !== 'default') {
      const remainingImagesInLayer = activePageImages.filter(
        img => img.layer?.id === imageToDelete.layer?.id && img.id !== imageId
      )
      
      if (remainingImagesInLayer.length === 0) {
        removeLayer(imageToDelete.layer.id)
      }
    }
  }

  const handleImageUpdate = useCallback((imageId: string, updates: Partial<CanvasImage>) => {
    console.log(updates);
    
    updateImage(activePageId, imageId, updates)
  }, [activePageId, updateImage])

  // Get layers for current page
  const currentLayers = getActivePageLayers()

  // Handle moving layers
  const handleMoveLayer = useCallback((layerId: string, direction: 'up' | 'down') => {
    const currentIndex = currentLayers.findIndex(l => l.id === layerId)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (targetIndex >= 0 && targetIndex < currentLayers.length) {
      reorderLayers(currentIndex, targetIndex)
    }
  }, [currentLayers, reorderLayers])

  // Handle layer deletion with image cleanup
  const handleRemoveLayer = useCallback((layerId: string) => {
    // Remove all images in this layer
    const imagesInLayer = activePageImages.filter(img => img.layer?.id === layerId)
    imagesInLayer.forEach(img => {
      removeImageFromPage(activePageId, img.id)
    })
    
    // Remove the layer
    removeLayer(layerId)
    
    // Clear selection if the deleted layer was selected
    if (activeLayerId === layerId) {
      clearSelection()
    }
  }, [activePageImages, activePageId, removeImageFromPage, removeLayer, activeLayerId, clearSelection])

  // Handle page deletion
  const handleDeletePage = useCallback((pageId: string) => {
    const success = deletePage(pageId)
    if (success && activePageId === pageId) {
      clearSelection()
    }
  }, [deletePage, activePageId, clearSelection])

  return (
    <div className="editor">
      <Toolbar 
        activePanel={activePanel} 
        onPanelChange={setActivePanel} 
      />
      
      {activePanel === 'layers' && (
        <LayerPanel
          layers={activePageLayers}
          activeLayerId={activeLayerId}
          onSelectLayer={handleSelectLayer}
          onToggleVisibility={toggleLayerVisibility}
          onToggleLock={(id) => {
            //toggle here
          }}
          onRemoveLayer={handleRemoveLayer}
          onMoveLayer={handleMoveLayer}
          onOpacityChange={updateLayerOpacity}
        />
      )}

      {activePanel === 'pages' && (
        <PagesPanel 
          pages={pages}
          activePageId={activePageId}
          onSelectPage={setActivePageId}
          onAddPage={() => addPage(backgroundItem)}
          onDuplicatePage={duplicatePage}
          onDeletePage={handleDeletePage}
          onRenamePage={renamePage}
          onReorderPages={reorderPages}
        />
      )}
      
      {activePanel === 'library' && (
        <LibraryPanel
          images={libraryImages}
          onUpload={handleUpload}
          onSelect={addImageToCanvas}
        />
      )}

      <Workspace 
        images={activePageImages}
        selectedId={selectedId}
        multiSelectedIds={multiSelectedIds}
        onSelect={select}
        onImageDelete={handleImageDelete}
        onImageUpdate={handleImageUpdate}
        canvasParams={canvasParams}
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
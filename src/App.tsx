/* Works as controller bridge between ui and canvas and inits PIXI Application (root container) */
import { useEffect, useState } from "react"
import Workspace from "./components/Workspace"
import LibraryPanel from "./ui/LibraryPanel"
import type { LibraryImage } from "./types/LibraryImage"
import type { CanvasImage } from "./types/CanvasImage"
import { LayerPanel } from "./ui/LayerPanel"
import { useLayers } from "./hooks/useLayers"
import { getNextZIndex } from "./utils/newId"

export default function App() {
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([])
  const [canvasImages, setCanvasImages] = useState<CanvasImage[]>([])

  // useEffect(() => {
  //   // Cleanup function
  //   return () => {
  //     libraryImages.forEach(img => {
  //       if (img.preview) {
  //         URL.revokeObjectURL(img.preview);
  //       }
  //     });
  //   };
  // }, [libraryImages]);

  const handleUpload = (files: File[]) => {
    const newImages = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file)
    }))

    setLibraryImages(prev => [...prev, ...newImages])
  }

  const addImageToCanvas = async (img: LibraryImage) => {
    // Get image dimensions
    const dimensions = await getImageDimensions(img.preview)
    
    const newCanvasImage: CanvasImage = {
      id: crypto.randomUUID(),
      texture: img.preview,
      x: 200,
      y: 200,
      originalWidth: dimensions.width,
      originalHeight: dimensions.height,
      scale: { x: 1, y: 1 },
      rotation: 0,
      layer: {
        id: crypto.randomUUID(),
        name: 'Layer',
        visible: true,
        opacity: 0,
        zIndex: getNextZIndex()
      }
    }

    setCanvasImages(prev => [...prev, newCanvasImage])
  }

  const {
    layers,
    activeLayerId,
    addLayer,
    removeLayer,
    updateLayer,
    moveLayer,
    setActiveLayerId
  } = useLayers(canvasImages)

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
        onSelectLayer={setActiveLayerId}
        onToggleVisibility={(id) => updateLayer(id, { visible: !layers.find(l => l.id === id)?.visible })}
        onToggleLock={(id) => updateLayer(id, { locked: !layers.find(l => l.id === id)?.locked })}
        onRemoveLayer={removeLayer}
        onMoveLayer={moveLayer}
        onOpacityChange={(id, opacity) => updateLayer(id, { opacity })}
        onAddLayer={() => addLayer(`Layer ${layers.length + 1}`)}
      />
      <Workspace 
        images={canvasImages}
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
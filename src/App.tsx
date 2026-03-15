import { useEffect, useState } from "react"
import Canvas from "./components/canvas/Canvas"
import LibraryPanel from "./ui/LibraryPanel"
import type { LibraryImage } from "./types/LibraryImage"
import type { CanvasImage } from "./types/CanvasImage"

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
      rotation: 0
    }

    setCanvasImages(prev => [...prev, newCanvasImage])
  }

  const handleImageMoved = (movedImage: CanvasImage) => {
    setCanvasImages(prev =>
      prev.map(img =>
        img.id === movedImage.id ? movedImage : img
      )
    )
  }

  return (
    <div className="editor">
      <LibraryPanel
        images={libraryImages}
        onUpload={handleUpload}
        onSelect={addImageToCanvas}
      />

      <Canvas 
        images={canvasImages} 
        onImageMoved={handleImageMoved}
        onImageTransformed={handleImageMoved}
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
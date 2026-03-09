import { useState } from "react"
import Canvas from "./editor/components/Canvas"
import Toolbar from "./ui/Toolbar"
import type { LibraryImage } from "./types/LibraryImage"
import type { CanvasImage } from "./types/CanvasImage"

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

  const addImageToCanvas = (img: LibraryImage) => {
    const newCanvasImage: CanvasImage = {
      id: crypto.randomUUID(),
      texture: img.preview,
      x: 200,
      y: 200
    }

    setCanvasImages(prev => [...prev, newCanvasImage])
  }

  return (
    <div className="editor">
      <Toolbar
        images={libraryImages}
        onUpload={handleUpload}
        onSelect={addImageToCanvas}
      />

      <Canvas images={canvasImages} />
    </div>
  )
}


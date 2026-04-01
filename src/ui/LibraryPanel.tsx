import type { LibraryImage } from "../types/LibraryImage"
import { ImageLibrary } from "./components/ImageLibrary"
import { ImageUploader } from "./components/ImageUploader"

type Props = {
  images: LibraryImage[]
  onUpload: (files: File[]) => void
  onSelect: (img: LibraryImage) => void
}

export default function LibraryPanel({ images, onUpload, onSelect }: Props) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Image Library</h3>
        <ImageUploader onUpload={onUpload} />
      </div>
      <div className="panel-content">
        <ImageLibrary images={images} onSelect={onSelect} />
      </div>
    </div>
  )
}
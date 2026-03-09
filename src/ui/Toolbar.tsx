import type { LibraryImage } from "../types/LibraryImage"
import { ImageLibrary } from "./components/ImageLibrary"
import { ImageUploader } from "./components/ImageUploader"

type Props = {
  images: LibraryImage[]
  onUpload: (files: File[]) => void
  onSelect: (img: LibraryImage) => void
}

export default function Toolbar({ images, onUpload, onSelect }: Props) {
  return (
    <div className="toolbar">
      <ImageUploader onUpload={onUpload} />

      <ImageLibrary
        images={images}
        onSelect={onSelect}
      />
    </div>
  )
}
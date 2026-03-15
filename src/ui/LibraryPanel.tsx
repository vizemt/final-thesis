import { useState } from "react"
import type { LibraryImage } from "../types/LibraryImage"
import { ImageLibrary } from "./components/ImageLibrary"
import { ImageUploader } from "./components/ImageUploader"
import { ChevronUp, ChevronDown } from "lucide-react"

type Props = {
  images: LibraryImage[]
  onUpload: (files: File[]) => void
  onSelect: (img: LibraryImage) => void
}

export default function LibraryPanel({ images, onUpload, onSelect }: Props) {
  const [isHidden, setIsHidden] = useState(false)

  return (
    <>
      <div className={`toolbar ${isHidden ? 'hidden' : ''}`}>
        <ImageUploader onUpload={onUpload} />
        <ImageLibrary images={images} onSelect={onSelect} />
      </div>
      <button 
        className="toolbar-toggle"
        onClick={() => setIsHidden(!isHidden)}
        aria-label={isHidden ? "Show toolbar" : "Hide toolbar"}
      >
        {isHidden ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        <span style={{ fontSize: '12px' }}>
          {isHidden ? 'Show' : 'Hide'} library
        </span>
      </button>
    </>
  )
}
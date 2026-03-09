import type { LibraryImage } from "../../types/LibraryImage";

type Props = {
  images: LibraryImage[];
  onSelect: (img: LibraryImage) => void;
};

export const ImageLibrary: React.FC<Props> = ({ images, onSelect }) => {
  return (
    <div className="library">
      {images?.map(img => (
        <div
          key={img.id}
          className="library-item"
          onClick={() => onSelect(img)}
        >
          <img src={img.preview} alt="" />
        </div>
      ))}
    </div>
  );
};

/*import { useState } from "react";
import { ImageUploader } from "./components/ImageUploader";
import type { LibraryImage } from "../types/LibraryImage";

const handleUpload = (files: File[]) => {
  const newImages = files.map(file => ({
    id: crypto.randomUUID(),
    file,
    preview: URL.createObjectURL(file)
  }));

  setImages(prev => [...prev, ...newImages]);
};

const [images, setImages] = useState<LibraryImage[]>([]);

*/

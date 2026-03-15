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


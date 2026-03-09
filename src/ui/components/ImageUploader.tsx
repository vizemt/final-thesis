import React, { useRef } from "react";

type Props = {
  onUpload: (files: File[]) => void;
};

export const ImageUploader: React.FC<Props> = ({ onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files).filter(file =>
      ["image/png", "image/jpeg"].includes(file.type)
    );

    onUpload(files);
  };

  return (
    <div>
      <button onClick={() => inputRef.current?.click()}>
        Upload Image
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        multiple
        style={{ display: "none" }}
        onChange={handleFiles}
      />
    </div>
  );
};
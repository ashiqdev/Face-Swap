import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  onImageUpload: (base64: string, mimeType: string) => void;
  title: string;
  description: string;
  id: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, title, description, id }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImagePreview(reader.result as string);
        onImageUpload(base64String, file.type);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
       if(fileInputRef.current) {
        fileInputRef.current.files = event.dataTransfer.files;
       }
       handleFileChange({target: {files: event.dataTransfer.files}} as unknown as React.ChangeEvent<HTMLInputElement>)
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="w-full cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center justify-center p-2 border-2 border-dashed rounded-lg border-gray-700/80 hover:border-brand-secondary transition-colors duration-300 bg-black/20 min-h-[300px] overflow-hidden">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
          ) : (
            <div className="text-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-brand-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
               </svg>
              <p className="mt-2 font-semibold text-brand-text">{title}</p>
              <p className="text-xs text-brand-text-muted mt-1">{description}</p>
            </div>
          )}
        </div>
      </label>
      <input
        ref={fileInputRef}
        id={id}
        name={id}
        type="file"
        className="sr-only"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploader;
import React, { useState, useCallback, useRef } from 'react';
import type { UploadedFile } from '../types';

interface ImageUploaderProps {
  onImageUpload: (file: UploadedFile | null) => void;
  uploadedFile: UploadedFile | null;
}

const toBase64 = (file: File): Promise<{ base64: string, mimeType: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [mimeType, base64Data] = result.split(',');
      resolve({ base64: base64Data, mimeType: mimeType.split(':')[1].split(';')[0] });
    };
    reader.onerror = (error) => reject(error);
  });

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, uploadedFile }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      try {
        const { base64, mimeType } = await toBase64(file);
        onImageUpload({ base64, mimeType, name: file.name });
      } catch (error) {
        console.error("Error al convertir archivo a base64", error);
        alert("Hubo un error al procesar tu imagen. Por favor, inténtalo de nuevo.");
      }
    }
  }, [onImageUpload]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-brand-blue">1. Sube tu Foto</h2>
        {uploadedFile ? (
            <div className="text-center">
                <img src={`data:${uploadedFile.mimeType};base64,${uploadedFile.base64}`} alt="Foto subida por el usuario" className="max-h-80 w-auto mx-auto rounded-lg mb-4 shadow-sm" />
                <p className="text-gray-600 truncate">Cargado: {uploadedFile.name}</p>
                <button onClick={() => onImageUpload(null)} className="mt-2 text-sm text-brand-teal hover:underline">Cambiar Foto</button>
            </div>
        ) : (
            <div 
                onDragEnter={handleDrag} 
                onDragLeave={handleDrag} 
                onDragOver={handleDrag} 
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${dragActive ? 'border-brand-teal bg-teal-50' : 'border-gray-300 bg-gray-50'}`}>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
                <div className="flex flex-col items-center justify-center space-y-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    <p className="text-gray-500">Arrastra y suelta una foto aquí, o</p>
                    <button onClick={onButtonClick} className="px-6 py-2 bg-brand-teal text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors">
                    Buscar Archivos
                    </button>
                    <p className="text-xs text-gray-400">Se aceptan PNG, JPG, WEBP</p>
                </div>
            </div>
        )}
    </div>
  );
};
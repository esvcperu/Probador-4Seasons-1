import React, { useState, useRef, useCallback } from 'react';
import type { ClothingSelection, UploadedFile } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface ClothingSelectorProps {
  clothing: ClothingSelection;
  setClothing: React.Dispatch<React.SetStateAction<ClothingSelection>>;
  onGenerate: () => void;
  disabled: boolean;
}

enum GarmentType {
  ONE_PIECE = 'ONE_PIECE',
  TWO_PIECE = 'TWO_PIECE',
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

const ClothingItemUploader: React.FC<{
  label: string;
  item: UploadedFile | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  id: string;
}> = ({ label, item, onFileSelect, onRemove, id }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div>
            <span className="block text-sm font-medium text-gray-700">{label}</span>
            <div className="mt-1">
                {item ? (
                    <div className="relative group aspect-square">
                        <img src={`data:${item.mimeType};base64,${item.base64}`} alt={label} className="w-full h-full object-cover rounded-md shadow-sm" />
                        <button onClick={onRemove} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100" aria-label={`Quitar ${label}`}>
                          &times;
                        </button>
                    </div>
                ) : (
                    <div onClick={() => inputRef.current?.click()} className="flex justify-center items-center w-full h-full aspect-square px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-brand-teal">
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <p className="text-xs text-gray-500">Subir foto</p>
                        </div>
                        <input ref={inputRef} id={id} name={id} type="file" className="sr-only" accept="image/*" onChange={handleChange} />
                    </div>
                )}
            </div>
        </div>
    );
};


export const ClothingSelector: React.FC<ClothingSelectorProps> = ({ clothing, setClothing, onGenerate, disabled }) => {
  const [garmentType, setGarmentType] = useState<GarmentType>(GarmentType.TWO_PIECE);

  const handleGarmentTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newType = e.target.value as GarmentType;
    setGarmentType(newType);
    if (newType === GarmentType.ONE_PIECE) {
        setClothing(c => ({...c, bottom: null}));
    }
  };
  
  const handleFile = useCallback(async (file: File, type: keyof ClothingSelection) => {
    try {
        const { base64, mimeType } = await toBase64(file);
        setClothing(prev => ({...prev, [type]: { base64, mimeType, name: file.name }}));
    } catch (error) {
        console.error("Error al procesar la imagen de la prenda", error);
        alert("Hubo un error al cargar la imagen de la prenda.");
    }
  }, [setClothing]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-brand-blue">2. Elige tus Prendas</h2>
      
      <div className="mb-6">
        <fieldset className="flex items-center space-x-4">
            <legend className="text-sm font-medium text-gray-700 mb-2">¿Cuántas prendas?</legend>
            <div className="flex items-center">
                <input id="two-piece" type="radio" name="garmentType" value={GarmentType.TWO_PIECE} checked={garmentType === GarmentType.TWO_PIECE} onChange={handleGarmentTypeChange} className="h-4 w-4 text-brand-teal border-gray-300 focus:ring-brand-teal"/>
                <label htmlFor="two-piece" className="ml-2 block text-sm text-gray-900">Superior e Inferior</label>
            </div>
            <div className="flex items-center">
                <input id="one-piece" type="radio" name="garmentType" value={GarmentType.ONE_PIECE} checked={garmentType === GarmentType.ONE_PIECE} onChange={handleGarmentTypeChange} className="h-4 w-4 text-brand-teal border-gray-300 focus:ring-brand-teal"/>
                <label htmlFor="one-piece" className="ml-2 block text-sm text-gray-900">Una Pieza</label>
            </div>
        </fieldset>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ClothingItemUploader 
            id="top-uploader"
            label={garmentType === GarmentType.ONE_PIECE ? 'Prenda Única' : 'Prenda Superior'}
            item={clothing.top}
            onFileSelect={(file) => handleFile(file, 'top')}
            onRemove={() => setClothing(c => ({...c, top: null}))}
        />
         {garmentType === GarmentType.TWO_PIECE && (
            <ClothingItemUploader 
                id="bottom-uploader"
                label='Prenda Inferior'
                item={clothing.bottom}
                onFileSelect={(file) => handleFile(file, 'bottom')}
                onRemove={() => setClothing(c => ({...c, bottom: null}))}
            />
         )}
        <ClothingItemUploader 
            id="accessory-uploader"
            label='Accesorio (Opcional)'
            item={clothing.accessory}
            onFileSelect={(file) => handleFile(file, 'accessory')}
            onRemove={() => setClothing(c => ({...c, accessory: null}))}
        />
      </div>
      
      <button 
        onClick={onGenerate} 
        disabled={disabled || !clothing.top}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-brand-teal text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105"
      >
        <SparklesIcon />
        Generar mi Look
      </button>
    </div>
  );
};
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ClothingSelector } from './components/ClothingSelector';
import { Loader } from './components/Loader';
import { ImageGrid } from './components/ImageGrid';
import type { ClothingSelection, UploadedFile } from './types';
import { generateStyledImages } from './services/geminiService';

const App: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [clothingSelection, setClothingSelection] = useState<ClothingSelection>({
    top: null,
    bottom: null,
    accessory: null,
  });
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: UploadedFile | null) => {
    setUploadedFile(file);
    setGeneratedImages([]);
    setError(null);
  };
  
  const handleReset = () => {
    setUploadedFile(null);
    setGeneratedImages([]);
    setClothingSelection({ top: null, bottom: null, accessory: null });
    setError(null);
    setIsLoading(false);
  };

  const handleGeneration = useCallback(async () => {
    if (!uploadedFile) {
      setError('Por favor, sube una foto tuya primero.');
      return;
    }
    if (!clothingSelection.top) {
        setError('Por favor, sube la imagen de al menos una prenda de ropa.');
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      setLoadingMessage('Preparando el estilista de IA...');
      const images = await generateStyledImages(uploadedFile, clothingSelection, (msg) => setLoadingMessage(msg));
      setGeneratedImages(images);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido durante la generación de imágenes.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [uploadedFile, clothingSelection]);

  return (
    <div className="min-h-screen bg-gray-50 text-brand-blue font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Probador Virtual con IA</h1>
            <p className="text-lg text-gray-600">Sube tu foto, elige tu nuevo atuendo y ¡mira cómo se produce la magia!</p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">¡Ups! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {isLoading ? (
            <Loader message={loadingMessage} />
          ) : (
            <>
              {generatedImages.length > 0 ? (
                 <ImageGrid images={generatedImages} onReset={handleReset} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <ImageUploader onImageUpload={handleImageUpload} uploadedFile={uploadedFile} />
                  {uploadedFile && (
                    <ClothingSelector 
                      clothing={clothingSelection} 
                      setClothing={setClothingSelection} 
                      onGenerate={handleGeneration}
                      disabled={isLoading}
                    />
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} 4Seasons. Todos los derechos reservados. Creado con IA.</p>
      </footer>
    </div>
  );
};

export default App;
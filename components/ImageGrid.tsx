import React from 'react';

interface ImageGridProps {
  images: string[];
  onReset: () => void;
}

const imageDescriptions = [
    { title: 'Foto de Cuerpo Completo', subtitle: 'Ambiente de estudio' },
    { title: 'Primer Plano', subtitle: 'Vista detallada' },
    { title: 'Escena Doméstica', subtitle: 'Estilo de vida en casa' },
    { title: 'Escena Urbana/Natural', subtitle: 'En el exterior' }
]

export const ImageGrid: React.FC<ImageGridProps> = ({ images, onReset }) => {
  return (
    <div className="text-center">
        <h2 className="text-3xl font-bold mb-6 text-brand-blue">Tus Looks Creados con IA</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
            {images.map((image, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 group transform hover:-translate-y-1 transition-transform duration-300">
                    <img src={image} alt={`Estilo generado ${index + 1}`} className="w-full h-auto object-cover aspect-square"/>
                    <div className="p-4 bg-gray-50">
                        <h3 className="font-bold text-lg text-brand-blue">{imageDescriptions[index]?.title || `Estilo ${index + 1}`}</h3>
                        <p className="text-sm text-gray-500">{imageDescriptions[index]?.subtitle}</p>
                    </div>
                </div>
            ))}
        </div>
        <button 
            onClick={onReset} 
            className="mt-10 bg-brand-blue text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-colors duration-200"
        >
            Prueba un nuevo Outfit
        </button>
    </div>
  );
};
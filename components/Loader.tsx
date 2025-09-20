import React from 'react';

interface LoaderProps {
    message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-white p-12 rounded-lg shadow-lg border border-gray-200 min-h-[300px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-teal"></div>
        <p className="mt-6 text-xl font-semibold text-brand-blue">Generando tus imágenes...</p>
        <p className="mt-2 text-gray-500">{message || 'Esto puede tardar un momento.'}</p>
    </div>
  );
};
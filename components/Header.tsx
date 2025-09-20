
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-brand-blue shadow-md">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-3xl font-bold text-brand-white tracking-wider">
          4Seasons
          <span className="text-brand-teal text-4xl">.</span>
        </h1>
      </div>
    </header>
  );
};


import React from 'react';
import { PizzaIcon } from './PizzaIcon';

export const Loader: React.FC = () => {
  return (
    <div className="animate-spin-slow text-yellow-500">
      <PizzaIcon className="h-16 w-16" />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

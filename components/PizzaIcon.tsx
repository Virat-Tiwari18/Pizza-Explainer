import React from 'react';

interface PizzaIconProps {
  className?: string;
}

export const PizzaIcon: React.FC<PizzaIconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    {/* Base of the slice including crust */}
    <path 
      d="M21.58 16.38l-9.01-14.69a.75.75 0 00-1.33 0L2.24 16.6C.94 18.73 2.66 21.25 5.01 21.25h13.98c2.35 0 4.07-2.52 2.76-4.65l-.17-.22z"
      fill="#F29F05"
    />
    {/* Topping area */}
    <path 
      d="M19.91 16.12L12 3.5 4.09 16.12c-.93 1.5 0.35 3.38 2.16 3.38h11.5c1.81 0 3.09-1.88 2.16-3.38z"
      fill="#D94F2B"
    />
    {/* Toppings */}
    <circle cx="12" cy="9" r="1.5" fill="#F2D6B3" />
    <circle cx="9" cy="14" r="1.2" fill="#F2D6B3" />
    <circle cx="15" cy="14" r="1.2" fill="#F2D6B3" />
  </svg>
);

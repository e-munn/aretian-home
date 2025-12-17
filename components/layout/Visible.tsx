'use client';

import { ReactNode } from 'react';

interface VisibleProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper component that constrains content to the visible area
 * to the right of the navbar. Floats content to the right with
 * responsive left padding that accounts for navbar text width.
 */
export function Visible({ children, className = '' }: VisibleProps) {
  return (
    <div
      className={`w-full h-full flex items-center justify-end pl-[45vw] md:pl-[42vw] lg:pl-[38vw] xl:pl-[35vw] ${className}`}
    >
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
}

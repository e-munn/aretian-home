"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CursorContextType {
  hideCursor: boolean;
  setHideCursor: (hide: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  nearNavbar: boolean;
}

const CursorContext = createContext<CursorContextType>({
  hideCursor: false,
  setHideCursor: () => {},
  darkMode: false,
  setDarkMode: () => {},
  nearNavbar: false,
});

export function useCursorContext() {
  return useContext(CursorContext);
}

// Navbar zone: left 40% of screen width
const NAVBAR_ZONE_PERCENT = 0.4;

export function CursorProvider({ children }: { children: ReactNode }) {
  const [hideCursor, setHideCursor] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [nearNavbar, setNearNavbar] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const isNear = e.clientX < window.innerWidth * NAVBAR_ZONE_PERCENT;
      setNearNavbar(isNear);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <CursorContext.Provider value={{ hideCursor, setHideCursor, darkMode, setDarkMode, nearNavbar }}>
      {children}
    </CursorContext.Provider>
  );
}

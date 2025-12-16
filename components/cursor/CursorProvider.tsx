"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CursorContextType {
  hideCursor: boolean;
  setHideCursor: (hide: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const CursorContext = createContext<CursorContextType>({
  hideCursor: false,
  setHideCursor: () => {},
  darkMode: false,
  setDarkMode: () => {},
});

export function useCursorContext() {
  return useContext(CursorContext);
}

export function CursorProvider({ children }: { children: ReactNode }) {
  const [hideCursor, setHideCursor] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <CursorContext.Provider value={{ hideCursor, setHideCursor, darkMode, setDarkMode }}>
      {children}
    </CursorContext.Provider>
  );
}

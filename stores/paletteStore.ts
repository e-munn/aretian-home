import { create } from 'zustand';

// Color palette: background, building, dotGrid, buildingOpacity
export interface ColorPalette {
  bg: string;
  building: string;
  dotGrid: string;
  buildingOpacity: number;
}

// Default palette
const DEFAULT_PALETTE: ColorPalette = {
  bg: '#0c0c14',
  building: '#3c324e',
  dotGrid: '#4a3818',
  buildingOpacity: 0.7,
};

interface PaletteState {
  palette: ColorPalette;
  customBuildingColor: string | null;
  customBuildingOpacity: number | null;
  setBuildingColor: (color: string | null) => void;
  setBuildingOpacity: (opacity: number | null) => void;
}

export const usePaletteStore = create<PaletteState>((set) => ({
  palette: DEFAULT_PALETTE,
  customBuildingColor: '#2e2f48',
  customBuildingOpacity: 0.72,
  setBuildingColor: (color) => set({ customBuildingColor: color }),
  setBuildingOpacity: (opacity) => set({ customBuildingOpacity: opacity }),
}));

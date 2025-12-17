import { create } from 'zustand';

// Color palette: background, building, dotGrid, buildingOpacity
export interface ColorPalette {
  bg: string;
  building: string;
  dotGrid: string;
  buildingOpacity: number;
  name?: string;
}

// 100 vibrant, high-contrast color palettes
export const PALETTES: ColorPalette[] = [
  // Warm contrast series (like #96)
  { bg: '#0a0a10', building: '#1a1a2a', dotGrid: '#e8a87c', buildingOpacity: 0.85, name: 'Warm Sunset' },
  { bg: '#0a0a12', building: '#1a1a2e', dotGrid: '#f4b183', buildingOpacity: 0.75, name: 'Peach Glow' },
  { bg: '#08080e', building: '#161624', dotGrid: '#d4956a', buildingOpacity: 0.9, name: 'Copper' },
  { bg: '#0c0c14', building: '#1e1e30', dotGrid: '#ffb347', buildingOpacity: 0.7, name: 'Golden Hour' },
  { bg: '#0a0a0f', building: '#181828', dotGrid: '#e09f6b', buildingOpacity: 0.8, name: 'Amber Glow' },

  // Coral & rose
  { bg: '#0a0810', building: '#1a1828', dotGrid: '#ff6b6b', buildingOpacity: 0.75, name: 'Coral Pop' },
  { bg: '#0c0a12', building: '#1c1a2a', dotGrid: '#ff8585', buildingOpacity: 0.85, name: 'Salmon' },
  { bg: '#080810', building: '#161628', dotGrid: '#e57373', buildingOpacity: 0.7, name: 'Rose' },
  { bg: '#0a0a14', building: '#1a1a30', dotGrid: '#f48fb1', buildingOpacity: 0.8, name: 'Pink Blush' },
  { bg: '#0c0812', building: '#1e1628', dotGrid: '#ff7f7f', buildingOpacity: 0.9, name: 'Soft Red' },

  // Electric blue
  { bg: '#08080e', building: '#141428', dotGrid: '#64b5f6', buildingOpacity: 0.8, name: 'Electric Blue' },
  { bg: '#0a0a12', building: '#18182e', dotGrid: '#42a5f5', buildingOpacity: 0.7, name: 'Sky Blue' },
  { bg: '#060610', building: '#121228', dotGrid: '#5dade2', buildingOpacity: 0.85, name: 'Bright Azure' },
  { bg: '#0808 0c', building: '#161624', dotGrid: '#7fc8ff', buildingOpacity: 0.75, name: 'Ice Blue' },
  { bg: '#0a0810', building: '#1a1628', dotGrid: '#82b1ff', buildingOpacity: 0.9, name: 'Periwinkle' },

  // Mint & teal
  { bg: '#080a0c', building: '#161a20', dotGrid: '#4dd0e1', buildingOpacity: 0.75, name: 'Cyan Pop' },
  { bg: '#060a0a', building: '#121a1e', dotGrid: '#26c6da', buildingOpacity: 0.85, name: 'Teal Bright' },
  { bg: '#080c0c', building: '#182020', dotGrid: '#64ffda', buildingOpacity: 0.7, name: 'Mint' },
  { bg: '#0a0c0e', building: '#1a1e24', dotGrid: '#4db6ac', buildingOpacity: 0.8, name: 'Sea Foam' },
  { bg: '#060808', building: '#121618', dotGrid: '#80deea', buildingOpacity: 0.9, name: 'Aqua' },

  // Lime & green
  { bg: '#080a08', building: '#161a16', dotGrid: '#9ccc65', buildingOpacity: 0.8, name: 'Lime' },
  { bg: '#0a0c0a', building: '#1a1e1a', dotGrid: '#aed581', buildingOpacity: 0.7, name: 'Spring Green' },
  { bg: '#060806', building: '#121612', dotGrid: '#8bc34a', buildingOpacity: 0.85, name: 'Grass' },
  { bg: '#080a06', building: '#181c12', dotGrid: '#c5e1a5', buildingOpacity: 0.75, name: 'Pale Green' },
  { bg: '#0a0c08', building: '#1c2018', dotGrid: '#b2ff59', buildingOpacity: 0.9, name: 'Neon Lime' },

  // Purple & violet
  { bg: '#0a080e', building: '#1a162a', dotGrid: '#b39ddb', buildingOpacity: 0.8, name: 'Lavender' },
  { bg: '#0c0812', building: '#1e162e', dotGrid: '#ce93d8', buildingOpacity: 0.75, name: 'Orchid' },
  { bg: '#080610', building: '#161228', dotGrid: '#ba68c8', buildingOpacity: 0.85, name: 'Purple Pop' },
  { bg: '#0a0814', building: '#1c1430', dotGrid: '#ea80fc', buildingOpacity: 0.7, name: 'Magenta' },
  { bg: '#0c0a10', building: '#1e1a28', dotGrid: '#d1c4e9', buildingOpacity: 0.9, name: 'Soft Violet' },

  // Gold & yellow
  { bg: '#0a0a08', building: '#1a1a14', dotGrid: '#ffd54f', buildingOpacity: 0.75, name: 'Gold' },
  { bg: '#0c0c0a', building: '#1e1e18', dotGrid: '#ffee58', buildingOpacity: 0.85, name: 'Lemon' },
  { bg: '#08080 6', building: '#161610', dotGrid: '#ffca28', buildingOpacity: 0.8, name: 'Sunflower' },
  { bg: '#0a0a06', building: '#1c1c12', dotGrid: '#fff59d', buildingOpacity: 0.7, name: 'Pale Yellow' },
  { bg: '#0c0a08', building: '#201814', dotGrid: '#ffc107', buildingOpacity: 0.9, name: 'Amber' },

  // Dual tone - warm bg
  { bg: '#100a08', building: '#281a14', dotGrid: '#64b5f6', buildingOpacity: 0.75, name: 'Warm Blue' },
  { bg: '#0e0806', building: '#241410', dotGrid: '#4dd0e1', buildingOpacity: 0.8, name: 'Warm Cyan' },
  { bg: '#120a0a', building: '#2a1818', dotGrid: '#9ccc65', buildingOpacity: 0.85, name: 'Warm Lime' },
  { bg: '#100808', building: '#281414', dotGrid: '#ce93d8', buildingOpacity: 0.7, name: 'Warm Orchid' },
  { bg: '#0e0a08', building: '#241c14', dotGrid: '#80cbc4', buildingOpacity: 0.9, name: 'Warm Teal' },

  // Dual tone - cool bg
  { bg: '#080a10', building: '#141a28', dotGrid: '#ff8a65', buildingOpacity: 0.8, name: 'Cool Orange' },
  { bg: '#060810', building: '#101428', dotGrid: '#ffb74d', buildingOpacity: 0.75, name: 'Cool Amber' },
  { bg: '#080c12', building: '#141e2a', dotGrid: '#f48fb1', buildingOpacity: 0.85, name: 'Cool Pink' },
  { bg: '#0a0a12', building: '#18182e', dotGrid: '#ffd54f', buildingOpacity: 0.7, name: 'Cool Gold' },
  { bg: '#060a0e', building: '#101a24', dotGrid: '#ff7043', buildingOpacity: 0.9, name: 'Cool Coral' },

  // Neon series
  { bg: '#050508', building: '#0e0e18', dotGrid: '#00e5ff', buildingOpacity: 0.65, name: 'Neon Cyan' },
  { bg: '#060608', building: '#10101a', dotGrid: '#76ff03', buildingOpacity: 0.6, name: 'Neon Green' },
  { bg: '#08060a', building: '#14101c', dotGrid: '#ff1744', buildingOpacity: 0.7, name: 'Neon Red' },
  { bg: '#06050a', building: '#100e1a', dotGrid: '#d500f9', buildingOpacity: 0.65, name: 'Neon Purple' },
  { bg: '#080806', building: '#141410', dotGrid: '#ffea00', buildingOpacity: 0.6, name: 'Neon Yellow' },

  // Pastel bright
  { bg: '#0c0c10', building: '#1e1e28', dotGrid: '#f8bbd0', buildingOpacity: 0.85, name: 'Pastel Pink' },
  { bg: '#0a0c0e', building: '#1a1e24', dotGrid: '#b3e5fc', buildingOpacity: 0.8, name: 'Pastel Blue' },
  { bg: '#0c0e0c', building: '#1e221e', dotGrid: '#c8e6c9', buildingOpacity: 0.75, name: 'Pastel Green' },
  { bg: '#0e0c0a', building: '#221e18', dotGrid: '#ffe0b2', buildingOpacity: 0.9, name: 'Pastel Orange' },
  { bg: '#0c0a0e', building: '#1e181e', dotGrid: '#e1bee7', buildingOpacity: 0.85, name: 'Pastel Purple' },

  // Jewel tones
  { bg: '#060808', building: '#101414', dotGrid: '#00bcd4', buildingOpacity: 0.8, name: 'Turquoise' },
  { bg: '#080608', building: '#141014', dotGrid: '#e91e63', buildingOpacity: 0.75, name: 'Ruby' },
  { bg: '#06080a', building: '#101418', dotGrid: '#3f51b5', buildingOpacity: 0.85, name: 'Sapphire' },
  { bg: '#080a06', building: '#141810', dotGrid: '#4caf50', buildingOpacity: 0.7, name: 'Emerald' },
  { bg: '#0a0806', building: '#181410', dotGrid: '#ff9800', buildingOpacity: 0.9, name: 'Topaz' },

  // High contrast mono
  { bg: '#040404', building: '#0c0c0c', dotGrid: '#e0e0e0', buildingOpacity: 0.7, name: 'Silver' },
  { bg: '#060606', building: '#101010', dotGrid: '#f5f5f5', buildingOpacity: 0.65, name: 'White Pop' },
  { bg: '#050505', building: '#0e0e0e', dotGrid: '#bdbdbd', buildingOpacity: 0.75, name: 'Platinum' },
  { bg: '#080808', building: '#141414', dotGrid: '#fafafa', buildingOpacity: 0.6, name: 'Bright White' },
  { bg: '#040406', building: '#0c0c10', dotGrid: '#cfd8dc', buildingOpacity: 0.8, name: 'Cool Silver' },

  // Sunset gradient feel
  { bg: '#0c0608', building: '#1e1014', dotGrid: '#ff6e40', buildingOpacity: 0.75, name: 'Deep Sunset' },
  { bg: '#0e0808', building: '#221414', dotGrid: '#ff5252', buildingOpacity: 0.8, name: 'Red Sun' },
  { bg: '#100806', building: '#281410', dotGrid: '#ff9100', buildingOpacity: 0.85, name: 'Orange Sun' },
  { bg: '#0a0606', building: '#1c1010', dotGrid: '#ff4081', buildingOpacity: 0.7, name: 'Pink Sun' },
  { bg: '#0e0a08', building: '#241814', dotGrid: '#ffab40', buildingOpacity: 0.9, name: 'Golden Sun' },

  // Ocean depth
  { bg: '#04080c', building: '#0c1420', dotGrid: '#29b6f6', buildingOpacity: 0.75, name: 'Ocean Light' },
  { bg: '#060a0e', building: '#101a24', dotGrid: '#00acc1', buildingOpacity: 0.8, name: 'Deep Sea' },
  { bg: '#040608', building: '#0c1014', dotGrid: '#26a69a', buildingOpacity: 0.85, name: 'Reef' },
  { bg: '#06080c', building: '#101420', dotGrid: '#4fc3f7', buildingOpacity: 0.7, name: 'Shallow' },
  { bg: '#080a10', building: '#141a28', dotGrid: '#00bfa5', buildingOpacity: 0.9, name: 'Lagoon' },

  // Forest
  { bg: '#060a06', building: '#101a10', dotGrid: '#66bb6a', buildingOpacity: 0.8, name: 'Forest' },
  { bg: '#080c08', building: '#141e14', dotGrid: '#81c784', buildingOpacity: 0.75, name: 'Canopy' },
  { bg: '#040804', building: '#0c140c', dotGrid: '#a5d6a7', buildingOpacity: 0.85, name: 'Moss' },
  { bg: '#060806', building: '#101410', dotGrid: '#69f0ae', buildingOpacity: 0.7, name: 'Glade' },
  { bg: '#080a08', building: '#141c14', dotGrid: '#b9f6ca', buildingOpacity: 0.9, name: 'Meadow' },

  // Berry
  { bg: '#0a060a', building: '#1a101a', dotGrid: '#ab47bc', buildingOpacity: 0.75, name: 'Grape' },
  { bg: '#0c080c', building: '#1e141e', dotGrid: '#8e24aa', buildingOpacity: 0.8, name: 'Plum' },
  { bg: '#080608', building: '#141014', dotGrid: '#7b1fa2', buildingOpacity: 0.85, name: 'Berry' },
  { bg: '#0a080a', building: '#181418', dotGrid: '#9c27b0', buildingOpacity: 0.7, name: 'Violet' },
  { bg: '#0c0a0c', building: '#1e181e', dotGrid: '#e040fb', buildingOpacity: 0.9, name: 'Fuchsia' },

  // Fire
  { bg: '#0c0604', building: '#1e0e08', dotGrid: '#ff5722', buildingOpacity: 0.75, name: 'Fire' },
  { bg: '#0e0806', building: '#22120c', dotGrid: '#f4511e', buildingOpacity: 0.8, name: 'Flame' },
  { bg: '#100804', building: '#28140a', dotGrid: '#ff6d00', buildingOpacity: 0.85, name: 'Blaze' },
  { bg: '#0a0604', building: '#1a0e08', dotGrid: '#ff9e80', buildingOpacity: 0.7, name: 'Ember' },
  { bg: '#0e0a06', building: '#22180e', dotGrid: '#ffab91', buildingOpacity: 0.9, name: 'Warm Glow' },

  // Ice
  { bg: '#060a0e', building: '#0e1822', dotGrid: '#81d4fa', buildingOpacity: 0.7, name: 'Ice' },
  { bg: '#080c10', building: '#121c28', dotGrid: '#4fc3f7', buildingOpacity: 0.75, name: 'Frost' },
  { bg: '#040810', building: '#0a1220', dotGrid: '#b3e5fc', buildingOpacity: 0.8, name: 'Snow' },
  { bg: '#060a0c', building: '#0e181c', dotGrid: '#e1f5fe', buildingOpacity: 0.65, name: 'Glacier' },
  { bg: '#080c0e', building: '#141e24', dotGrid: '#84ffff', buildingOpacity: 0.85, name: 'Arctic' },

  // Warm neutrals with pop
  { bg: '#0c0a08', building: '#201a14', dotGrid: '#ff7043', buildingOpacity: 0.8, name: 'Terra Coral' },
  { bg: '#0e0c0a', building: '#241e18', dotGrid: '#26c6da', buildingOpacity: 0.75, name: 'Terra Teal' },
  { bg: '#100c08', building: '#282014', dotGrid: '#9ccc65', buildingOpacity: 0.85, name: 'Terra Lime' },
  { bg: '#0a0806', building: '#1c1410', dotGrid: '#ec407a', buildingOpacity: 0.7, name: 'Terra Rose' },
  { bg: '#0c0a06', building: '#201810', dotGrid: '#42a5f5', buildingOpacity: 0.9, name: 'Terra Blue' },
];

interface PaletteState {
  currentIndex: number;
  palette: ColorPalette;
  next: () => void;
  prev: () => void;
  setIndex: (index: number) => void;
}

export const usePaletteStore = create<PaletteState>((set) => ({
  currentIndex: 0,
  palette: PALETTES[0],

  next: () => set((state) => {
    const newIndex = (state.currentIndex + 1) % PALETTES.length;
    return { currentIndex: newIndex, palette: PALETTES[newIndex] };
  }),

  prev: () => set((state) => {
    const newIndex = (state.currentIndex - 1 + PALETTES.length) % PALETTES.length;
    return { currentIndex: newIndex, palette: PALETTES[newIndex] };
  }),

  setIndex: (index: number) => set(() => {
    const safeIndex = Math.max(0, Math.min(index, PALETTES.length - 1));
    return { currentIndex: safeIndex, palette: PALETTES[safeIndex] };
  }),
}));

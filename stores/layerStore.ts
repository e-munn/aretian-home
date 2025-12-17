import { create } from 'zustand';

// Layer loading states - matches actual data fetches
export type LayerKey =
  | 'grid'
  | 'roads'
  | 'trees'
  | 'buildings'
  | 'parking'
  | 'bikeLanes'
  | 'busStops'
  | 'bicingStations'
  | 'trafficViolations'
  | 'flowParticles';

// Order layers load in (for legend display)
export const LAYER_ORDER: LayerKey[] = [
  'grid',
  'roads',
  'trees',
  'buildings',
  'parking',
  'bikeLanes',
  'busStops',
  'bicingStations',
  'trafficViolations',
  'flowParticles',
];

// Group definitions for legend
export const LAYER_GROUPS = [
  { key: 'roads', layers: ['grid', 'roads'] as LayerKey[] },
  { key: 'trees', layers: ['trees'] as LayerKey[] },
  { key: 'buildings', layers: ['buildings'] as LayerKey[] },
  { key: 'data', layers: ['parking', 'bikeLanes', 'busStops', 'bicingStations', 'trafficViolations', 'flowParticles'] as LayerKey[] },
];

interface LayerState {
  // Which layers have finished loading
  loaded: Record<LayerKey, boolean>;
  // Which layer is currently loading (for progress animation)
  currentlyLoading: LayerKey | null;
  // Mark a layer as loaded
  setLoaded: (layer: LayerKey) => void;
  // Set currently loading layer
  setCurrentlyLoading: (layer: LayerKey | null) => void;
  // Reset all loading state
  reset: () => void;
  // Check if all layers in a group are loaded
  isGroupLoaded: (groupKey: string) => boolean;
  // Check if any layer in a group is loading
  isGroupLoading: (groupKey: string) => boolean;
  // Get current loading index (for progress)
  getCurrentIndex: () => number;
  // Check if all layers are loaded
  isComplete: () => boolean;
}

const initialLoaded: Record<LayerKey, boolean> = {
  grid: false,
  roads: false,
  trees: false,
  buildings: false,
  parking: false,
  bikeLanes: false,
  busStops: false,
  bicingStations: false,
  trafficViolations: false,
  flowParticles: false,
};

export const useLayerStore = create<LayerState>((set, get) => ({
  loaded: { ...initialLoaded },
  currentlyLoading: null,

  setLoaded: (layer) => set((state) => ({
    loaded: { ...state.loaded, [layer]: true },
    currentlyLoading: state.currentlyLoading === layer ? null : state.currentlyLoading,
  })),

  setCurrentlyLoading: (layer) => set({ currentlyLoading: layer }),

  reset: () => set({
    loaded: { ...initialLoaded },
    currentlyLoading: null,
  }),

  isGroupLoaded: (groupKey) => {
    const group = LAYER_GROUPS.find(g => g.key === groupKey);
    if (!group) return false;
    const { loaded } = get();
    return group.layers.every(layer => loaded[layer]);
  },

  isGroupLoading: (groupKey) => {
    const group = LAYER_GROUPS.find(g => g.key === groupKey);
    if (!group) return false;
    const { currentlyLoading } = get();
    return currentlyLoading !== null && group.layers.includes(currentlyLoading);
  },

  getCurrentIndex: () => {
    const { loaded } = get();
    let index = 0;
    for (const layer of LAYER_ORDER) {
      if (loaded[layer]) index++;
      else break;
    }
    return index;
  },

  isComplete: () => {
    const { loaded } = get();
    return LAYER_ORDER.every(layer => loaded[layer]);
  },
}));

'use client';

import * as Progress from '@radix-ui/react-progress';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'motion/react';
import { useMemo, useEffect, useState } from 'react';
import {
  Route,
  TreePine,
  Database,
  Building2,
  LucideIcon,
} from 'lucide-react';
import { useSectionContext } from '@/components/navigation/FullPageScroll';
import { useLayerStore, LAYER_GROUPS as STORE_LAYER_GROUPS, LayerKey } from '@/stores/layerStore';

// Layer groups with icons and colors matching scene
interface LayerGroup {
  key: string;
  icon: LucideIcon;
  layers: LayerKey[];
  color: string;
}

const LAYER_GROUPS: LayerGroup[] = [
  { key: 'roads', icon: Route, layers: ['grid', 'roads'], color: '#7070a0' },
  { key: 'trees', icon: TreePine, layers: ['trees'], color: '#00C217' },
  { key: 'buildings', icon: Building2, layers: ['buildings'], color: '#5a7a9a' },
  { key: 'data', icon: Database, layers: ['parking', 'bikeLanes', 'busStops', 'bicingStations', 'trafficViolations', 'flowParticles'], color: '#FFFFFF' },
];

// Radial progress component for each icon
function RadialProgress({ isLoading, isComplete, color }: { isLoading: boolean; isComplete: boolean; color: string }) {
  const progress = useMotionValue(0);
  const pathLength = useTransform(progress, [0, 100], [0, 1]);

  useEffect(() => {
    if (isComplete) {
      animate(progress, 100, { duration: 0.2 });
    } else if (isLoading) {
      // Linear animation to 100%
      animate(progress, 100, { duration: 3, ease: 'linear' });
    } else {
      progress.set(0);
    }
  }, [isLoading, isComplete, progress]);

  if (!isLoading && !isComplete) return null;

  return (
    <Progress.Root className="absolute inset-0 -m-2">
      <Progress.Indicator asChild>
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            style={{
              pathLength,
              rotate: -90,
              transformOrigin: '50% 50%',
            }}
          />
        </svg>
      </Progress.Indicator>
    </Progress.Root>
  );
}

export function LoadingLegend() {
  const { activeIndex } = useSectionContext();
  const isVisible = activeIndex === 0; // Only show on overview section

  // Get loading state from store
  const loaded = useLayerStore((state) => state.loaded);
  const isComplete = useLayerStore((state) => state.isComplete());

  // Track which groups are currently "loading" (have some but not all layers loaded)
  const [loadingGroups, setLoadingGroups] = useState<Set<string>>(new Set());

  const groupStates = useMemo(() => {
    return LAYER_GROUPS.map((group) => {
      // Check if all layers in this group are loaded
      const allLoaded = group.layers.every(layer => loaded[layer]);
      // Check if any layer in this group is loaded (but not all)
      const someLoaded = group.layers.some(layer => loaded[layer]);

      if (allLoaded) return 'visible' as const;
      if (someLoaded || loadingGroups.has(group.key)) return 'loading' as const;
      return 'hidden' as const;
    });
  }, [loaded, loadingGroups]);

  // Track when groups start loading (first layer in group becomes loaded)
  useEffect(() => {
    LAYER_GROUPS.forEach((group) => {
      const someLoaded = group.layers.some(layer => loaded[layer]);
      const allLoaded = group.layers.every(layer => loaded[layer]);

      if (someLoaded && !allLoaded && !loadingGroups.has(group.key)) {
        setLoadingGroups(prev => new Set([...prev, group.key]));
      }
      if (allLoaded && loadingGroups.has(group.key)) {
        setLoadingGroups(prev => {
          const next = new Set(prev);
          next.delete(group.key);
          return next;
        });
      }
    });
  }, [loaded, loadingGroups]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-8 right-8 z-50"
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-8">
            {LAYER_GROUPS.map((group, index) => {
              const Icon = group.icon;
              const state = groupStates[index];

              return (
                <motion.div
                  key={group.key}
                  className="relative flex items-center justify-center"
                  style={{ width: 36, height: 36 }}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: state === 'hidden' ? 0.3 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <RadialProgress
                    isLoading={state === 'loading'}
                    isComplete={state === 'visible'}
                    color={group.color}
                  />
                  <Icon
                    size={18}
                    style={{
                      color: state === 'visible'
                        ? group.color
                        : state === 'loading'
                        ? '#FFFFFF'
                        : 'rgba(255, 255, 255, 0.3)',
                    }}
                    className="relative z-10 transition-colors duration-500"
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { LAYER_GROUPS };

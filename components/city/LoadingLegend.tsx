'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Route, TreePine, Database, Building2, Circle, Triangle, Car, LucideIcon, Bike } from 'lucide-react';
import { useSectionContext } from '@/components/navigation/FullPageScroll';
import { useLayerStore, LayerKey, REVEAL_SEQUENCE } from '@/stores/layerStore';
import Magnet from '@/components/Magnet';
import TextType from '@/components/TextType';
import '@/components/TextType.css';

// Context for exclusive magnet activation
interface MagnetContextType {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

const MagnetContext = createContext<MagnetContextType>({
  activeId: null,
  setActiveId: () => {},
});

// Calculate the reveal delay for a set of layers (find the group they belong to)
function getRevealDelay(layers: LayerKey[]): number {
  for (const group of REVEAL_SEQUENCE) {
    if (layers.some(l => group.layers.includes(l))) {
      return group.delay;
    }
  }
  return 0;
}

// Circular progress ring component
interface CircularProgressProps {
  progress: number; // 0-1
  size: number;
  strokeWidth?: number;
  color: string;
}

function CircularProgress({
  progress,
  size,
  strokeWidth = 2.5,
  color,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0 -rotate-90"
      style={{ pointerEvents: 'none' }}
    >
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={0.15}
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: 'stroke-dashoffset 0.15s ease-out',
        }}
      />
    </svg>
  );
}

// Icon component with circular progress animation
interface LoadingIconProps {
  id: string;
  icon: LucideIcon;
  color: string;
  label: string;
  size?: 'sm' | 'md';
  layers: LayerKey[];
}

function LoadingIcon({
  id,
  icon: Icon,
  color,
  label,
  size = 'md',
  layers,
}: LoadingIconProps) {
  const dimensions = size === 'sm' ? 24 : 40;
  const iconSize = size === 'sm' ? 12 : 20;
  const strokeWidth = size === 'sm' ? 2 : 2.5;

  const revealed = useLayerStore((state) => state.revealed);
  const startTime = useLayerStore((state) => state.startTime);
  const setHoveredLayers = useLayerStore((state) => state.setHoveredLayers);
  const isRevealed = layers.every(l => revealed[l]);

  const { activeId, setActiveId } = useContext(MagnetContext);

  // Track progress animation
  const [progress, setProgress] = useState(0);
  const [showPulse, setShowPulse] = useState(false);

  // Get the delay for this layer group
  const revealDelay = getRevealDelay(layers);

  // Handle magnet activation
  const handleMagnetChange = useCallback((active: boolean) => {
    if (active) {
      setActiveId(id);
    } else if (activeId === id) {
      setActiveId(null);
    }
  }, [id, activeId, setActiveId]);

  // Is this icon's magnet disabled? (another icon is active OR not revealed)
  const isMagnetDisabled = !isRevealed || (activeId !== null && activeId !== id);

  // Animate progress based on startTime from store
  useEffect(() => {
    if (isRevealed) {
      // Jump to 100% when revealed
      setProgress(1);
      setShowPulse(true);
      return;
    }

    // If this layer reveals immediately or no start time yet, skip animation
    if (revealDelay === 0 || startTime === null) {
      return;
    }

    // Animate progress from 0 to ~95% based on elapsed time since reveal started
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(0.95, elapsed / revealDelay);
      setProgress(p);

      if (p < 0.95 && !isRevealed) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    // Keep animating
    const interval = setInterval(() => {
      if (!isRevealed) {
        requestAnimationFrame(animate);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRevealed, revealDelay, startTime]);

  // Reset pulse after animation
  useEffect(() => {
    if (showPulse) {
      const timer = setTimeout(() => setShowPulse(false), 600);
      return () => clearTimeout(timer);
    }
  }, [showPulse]);

  // Handle hover events for layer highlighting
  const handleMouseEnter = useCallback(() => {
    if (isRevealed) {
      setHoveredLayers(layers);
    }
  }, [isRevealed, layers, setHoveredLayers]);

  const handleMouseLeave = useCallback(() => {
    setHoveredLayers(null);
  }, [setHoveredLayers]);

  return (
    <Magnet
      padding={25}
      magnetStrength={3}
      disabled={isMagnetDisabled}
      onActiveChange={handleMagnetChange}
    >
      <motion.div
        className="relative flex items-center justify-center rounded-full cursor-pointer"
        style={{
          width: dimensions,
          height: dimensions,
          backgroundColor: `${color}20`,
        }}
        title={label}
        animate={{
          opacity: isRevealed ? 1 : 0.5 + progress * 0.4,
          scale: isRevealed ? 1 : 0.92 + progress * 0.08,
        }}
        transition={{ duration: 0.3 }}
        whileHover={isRevealed ? { scale: 1.1 } : {}}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Circular progress (visible while loading) */}
        {!isRevealed && progress > 0 && (
          <CircularProgress
            progress={progress}
            size={dimensions}
            strokeWidth={strokeWidth}
            color={color}
          />
        )}

        {/* Completed ring */}
        {isRevealed && (
          <CircularProgress
            progress={1}
            size={dimensions}
            strokeWidth={strokeWidth}
            color={color}
          />
        )}

        {/* Pulse ring on completion */}
        {showPulse && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `${strokeWidth}px solid ${color}` }}
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        )}

        {/* Icon */}
        <Icon size={iconSize} style={{ color }} />
      </motion.div>
    </Magnet>
  );
}

// Layer labels for display
const LAYER_LABELS: Record<string, string> = {
  roads: 'Roads & Grid',
  trees: 'Urban Trees',
  data: 'Infrastructure Data',
  busStops: 'Bus Stops',
  bicingStations: 'Bicing Stations',
  trafficViolations: 'Traffic Violations',
  flowParticles: 'Traffic Flow',
  buildings: 'Buildings',
};

// Sub-icons for the Data group
const DATA_SUB_ICONS: { id: string; icon: LucideIcon; color: string; label: string; layers: LayerKey[] }[] = [
  { id: 'busStops', icon: Circle, color: '#3b82f6', label: 'Bus', layers: ['busStops'] },
  { id: 'bicingStations', icon: Bike, color: '#ef4444', label: 'Bicing', layers: ['bicingStations'] },
  { id: 'trafficViolations', icon: Triangle, color: '#facc15', label: 'Traffic', layers: ['trafficViolations'] },
  { id: 'flowParticles', icon: Car, color: '#cc7000', label: 'Flow', layers: ['flowParticles'] },
];

export function LoadingLegend() {
  const { activeIndex } = useSectionContext();
  const isVisible = activeIndex === 0;

  // Track which icon's magnet is active (for exclusive activation)
  const [activeId, setActiveId] = useState<string | null>(null);

  // Get the label for the active icon
  const activeLabel = activeId ? LAYER_LABELS[activeId] || '' : '';

  return (
    <MagnetContext.Provider value={{ activeId, setActiveId }}>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Layer label - shows when an icon is magnetically active */}
            <div className="h-6 flex items-center justify-end pr-2">
              <AnimatePresence mode="wait">
                {activeLabel && (
                  <motion.div
                    key={activeId}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-white/80 text-sm font-medium tracking-wide"
                  >
                    <TextType
                      text={activeLabel}
                      typingSpeed={20}
                      showCursor={true}
                      cursorCharacter="_"
                      loop={false}
                      className="font-mono"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Icon row: [Roads] [Trees] [Data [a][b][c][d]] [Buildings] */}
            <div className="flex items-center gap-5 bg-black/30 backdrop-blur-sm rounded-full px-6 py-3">
              {/* Roads */}
              <LoadingIcon
                id="roads"
                icon={Route}
                color="#8a9cc0"
                label="Roads"
                layers={['grid', 'roads']}
              />

              {/* Trees */}
              <LoadingIcon
                id="trees"
                icon={TreePine}
                color="#22c55e"
                label="Trees"
                layers={['trees']}
              />

              {/* Data group with sub-icons */}
              <div className="flex items-center gap-3 bg-black/20 rounded-full px-4 py-1.5">
                <LoadingIcon
                  id="data"
                  icon={Database}
                  color="#f59e0b"
                  label="Data"
                  layers={['parking', 'bikeLanes', 'busStops', 'bicingStations', 'trafficViolations', 'flowParticles']}
                />
                {DATA_SUB_ICONS.map(({ id, icon, color, label, layers }) => (
                  <LoadingIcon
                    key={id}
                    id={id}
                    icon={icon}
                    color={color}
                    label={label}
                    size="sm"
                    layers={layers}
                  />
                ))}
              </div>

              {/* Buildings */}
              <LoadingIcon
                id="buildings"
                icon={Building2}
                color="#6366f1"
                label="Buildings"
                layers={['buildings']}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MagnetContext.Provider>
  );
}

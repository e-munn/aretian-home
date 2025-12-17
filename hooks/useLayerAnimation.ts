'use client';

import { useState, useEffect, useCallback } from 'react';
import { LayerVisibility } from '@/components/CityScene';

// Layer animation order
const LAYER_ORDER: (keyof LayerVisibility)[] = [
  'grid',
  'roads',
  'buildings',
  'trees',
  'parking',
  'bikeLanes',
  'busStops',
  'bicingStations',
  'trafficViolations',
  'flowParticles',
];

// All layers hidden
const NONE_VISIBLE: LayerVisibility = {
  grid: false,
  roads: false,
  buildings: false,
  trees: false,
  parking: false,
  bikeLanes: false,
  busStops: false,
  bicingStations: false,
  trafficViolations: false,
  flowParticles: false,
};

interface UseLayerAnimationOptions {
  /** Delay between each layer appearing (ms) */
  staggerDelay?: number;
  /** Initial delay before animation starts (ms) */
  initialDelay?: number;
  /** Whether to auto-start the animation */
  autoStart?: boolean;
  /** Callback when all layers are visible */
  onComplete?: () => void;
}

interface UseLayerAnimationReturn {
  /** Current layer visibility state */
  layers: LayerVisibility;
  /** Current layer index (0 to LAYER_ORDER.length) */
  currentIndex: number;
  /** Whether animation is complete */
  isComplete: boolean;
  /** Whether animation is currently running */
  isAnimating: boolean;
  /** Start the animation from the beginning */
  start: () => void;
  /** Reset to no layers visible */
  reset: () => void;
  /** Skip to all layers visible */
  skipToEnd: () => void;
  /** Show next layer immediately */
  showNext: () => void;
}

export function useLayerAnimation(options: UseLayerAnimationOptions = {}): UseLayerAnimationReturn {
  const {
    staggerDelay = 400,
    initialDelay = 500,
    autoStart = true,
    onComplete,
  } = options;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Build layers visibility from current index
  const layers: LayerVisibility = { ...NONE_VISIBLE };
  for (let i = 0; i < currentIndex; i++) {
    layers[LAYER_ORDER[i]] = true;
  }

  const isComplete = currentIndex >= LAYER_ORDER.length;

  const start = useCallback(() => {
    setCurrentIndex(0);
    setHasStarted(true);
    setIsAnimating(true);
  }, []);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setHasStarted(false);
    setIsAnimating(false);
  }, []);

  const skipToEnd = useCallback(() => {
    setCurrentIndex(LAYER_ORDER.length);
    setIsAnimating(false);
  }, []);

  const showNext = useCallback(() => {
    if (currentIndex < LAYER_ORDER.length) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart && !hasStarted) {
      const timer = setTimeout(() => {
        setHasStarted(true);
        setIsAnimating(true);
      }, initialDelay);
      return () => clearTimeout(timer);
    }
  }, [autoStart, hasStarted, initialDelay]);

  // Animation step effect
  useEffect(() => {
    if (!isAnimating || isComplete) {
      if (isComplete && isAnimating) {
        setIsAnimating(false);
        onComplete?.();
      }
      return;
    }

    const timer = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, staggerDelay);

    return () => clearTimeout(timer);
  }, [isAnimating, isComplete, currentIndex, staggerDelay, onComplete]);

  return {
    layers,
    currentIndex,
    isComplete,
    isAnimating,
    start,
    reset,
    skipToEnd,
    showNext,
  };
}

export { LAYER_ORDER, NONE_VISIBLE };

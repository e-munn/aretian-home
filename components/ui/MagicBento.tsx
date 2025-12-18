'use client';

import { useRef, useEffect, useCallback, useState, ReactNode } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '59, 130, 246';
const MOBILE_BREAKPOINT = 768;

// Corner element for card border animation
function Corner({
  thickness = 2,
  length = 12,
  color = "currentColor",
  position,
}: {
  thickness?: number;
  length?: number;
  color?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  const positionStyles = {
    'top-left': { top: 0, left: 0 },
    'top-right': { top: 0, right: 0 },
    'bottom-left': { bottom: 0, left: 0 },
    'bottom-right': { bottom: 0, right: 0 },
  };

  return (
    <>
      <div
        className="absolute transition-all duration-300"
        style={{
          width: thickness,
          height: length,
          backgroundColor: color,
          ...positionStyles[position],
        }}
      />
      <div
        className="absolute transition-all duration-300"
        style={{
          width: length,
          height: thickness,
          backgroundColor: color,
          ...positionStyles[position],
        }}
      />
    </>
  );
}

// Animated corners wrapper for bento cards
function CardCorners({ color, isHovered }: { color: string; isHovered: boolean }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-10"
      initial={{ opacity: 0 }}
      animate={{
        opacity: isHovered ? 1 : 0,
        rotate: isHovered ? 90 : 0,
      }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Corner position="top-left" color={color} length={16} thickness={2} />
      <Corner position="top-right" color={color} length={16} thickness={2} />
      <Corner position="bottom-left" color={color} length={16} thickness={2} />
      <Corner position="bottom-right" color={color} length={16} thickness={2} />
    </motion.div>
  );
}

export interface CardData {
  color: string;
  bgColor?: string;      // Light transparent background
  titleColor?: string;   // Dark title text color
  title: string;
  description: string;
  label: string;
  icon?: ReactNode;
  customContent?: ReactNode;  // Optional custom content (e.g., nested bento)
}

const createParticleElement = (x: number, y: number, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number
) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

interface ParticleCardProps {
  children: ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: React.CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ParticleCard = ({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false,
  onMouseEnter,
  onMouseLeave,
}: ParticleCardProps) => {
  const cardRef = useRef<HTMLButtonElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef<HTMLDivElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();
    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0, opacity: 0, duration: 0.3, ease: 'back.in(1.7)',
        onComplete: () => particle.parentNode?.removeChild(particle)
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    if (!particlesInitialized.current) initializeParticles();

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;
        const clone = particle.cloneNode(true) as HTMLDivElement;
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);
        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
        gsap.to(clone, { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100, rotation: Math.random() * 360, duration: 2 + Math.random() * 2, ease: 'none', repeat: -1, yoyo: true });
        gsap.to(clone, { opacity: 0.3, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: true });
      }, index * 100);
      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;
    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();
      if (enableTilt) gsap.to(element, { rotateX: 2, rotateY: 2, duration: 0.3, ease: 'power2.out', transformPerspective: 1000 });
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();
      if (enableTilt) gsap.to(element, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' });
      if (enableMagnetism) gsap.to(element, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;
        gsap.to(element, { rotateX, rotateY, duration: 0.1, ease: 'power2.out', transformPerspective: 1000 });
      }
      if (enableMagnetism) {
        magnetismAnimationRef.current = gsap.to(element, { x: (x - centerX) * 0.05, y: (y - centerY) * 0.05, duration: 0.3, ease: 'power2.out' });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxDist = Math.max(Math.hypot(x, y), Math.hypot(x - rect.width, y), Math.hypot(x, y - rect.height), Math.hypot(x - rect.width, y - rect.height));
      const ripple = document.createElement('div');
      ripple.style.cssText = `position: absolute; width: ${maxDist * 2}px; height: ${maxDist * 2}px; border-radius: 50%; background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%); left: ${x - maxDist}px; top: ${y - maxDist}px; pointer-events: none; z-index: 1000;`;
      element.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() });
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return (
    <button
      ref={cardRef}
      type="button"
      className={`${className} particle-container`}
      style={{ ...style, position: 'relative', overflow: 'hidden', cursor: 'default', textAlign: 'left' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-cursor-corners
    >
      {children}
    </button>
  );
};

interface GlobalSpotlightProps {
  gridRef: React.RefObject<HTMLDivElement>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}

const GlobalSpotlight = ({ gridRef, disableAnimations = false, enabled = true, spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS, glowColor = DEFAULT_GLOW_COLOR }: GlobalSpotlightProps) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;
    const spotlight = document.createElement('div');
    spotlight.style.cssText = `position: fixed; width: 800px; height: 800px; border-radius: 50%; pointer-events: none; background: radial-gradient(circle, rgba(${glowColor}, 0.15) 0%, rgba(${glowColor}, 0.08) 15%, rgba(${glowColor}, 0.04) 25%, rgba(${glowColor}, 0.02) 40%, rgba(${glowColor}, 0.01) 65%, transparent 70%); z-index: 200; opacity: 0; transform: translate(-50%, -50%); mix-blend-mode: screen;`;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return;
      const section = gridRef.current.closest('.bento-section');
      const rect = section?.getBoundingClientRect();
      const mouseInside = rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      const cards = gridRef.current.querySelectorAll('.magic-bento-card');

      if (!mouseInside) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        cards.forEach(card => (card as HTMLElement).style.setProperty('--glow-intensity', '0'));
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach(card => {
        const cardElement = card as HTMLElement;
        const cardRect = cardElement.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);
        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) glowIntensity = 1;
        else if (effectiveDistance <= fadeDistance) glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, { left: e.clientX, top: e.clientY, duration: 0.1, ease: 'power2.out' });
      const targetOpacity = minDistance <= proximity ? 0.8 : minDistance <= fadeDistance ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8 : 0;
      gsap.to(spotlightRef.current, { opacity: targetOpacity, duration: targetOpacity > 0 ? 0.2 : 0.5, ease: 'power2.out' });
    };

    const handleMouseLeave = () => {
      gridRef.current?.querySelectorAll('.magic-bento-card').forEach(card => (card as HTMLElement).style.setProperty('--glow-intensity', '0'));
      if (spotlightRef.current) gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

const BentoCardGrid = ({ children, gridRef, isMobile }: { children: ReactNode; gridRef: React.RefObject<HTMLDivElement>; isMobile: boolean }) => (
  <div className="bento-section w-full h-full flex items-start justify-center p-4 pt-2 md:p-6 md:pt-3 overflow-y-auto" ref={gridRef} data-scrollable>
    <div
      className="w-full h-full"
      style={isMobile ? {
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(8px, 1.5vh, 16px)',
      } : {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: 'clamp(8px, 1.5vh, 16px)',
        gridTemplateAreas: `
          "a a b b"
          "a a c c"
        `
      }}
    >
      {children}
    </div>
  </div>
);

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
};

interface MagicBentoProps {
  cards: CardData[];
  textAutoHide?: boolean;
  hideTitle?: boolean;
  darkMode?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}

// Individual card with hover-activated corner animation
function BentoCardWithCorners({
  card,
  index,
  textAutoHide,
  enableBorderGlow,
  darkMode,
  glowColor,
  shouldDisableAnimations,
  particleCount,
  enableTilt,
  clickEffect,
  enableMagnetism,
  hideTitle,
  isMobile,
}: {
  card: CardData;
  index: number;
  textAutoHide: boolean;
  enableBorderGlow: boolean;
  darkMode: boolean;
  glowColor: string;
  shouldDisableAnimations: boolean;
  particleCount: number;
  enableTilt: boolean;
  clickEffect: boolean;
  enableMagnetism: boolean;
  hideTitle: boolean;
  isMobile: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const gridAreas = ['a', 'c', 'b'];
  const baseClassName = `magic-bento-card ${textAutoHide ? 'magic-bento-card--text-autohide' : ''} ${enableBorderGlow ? 'magic-bento-card--border-glow' : ''} ${!darkMode ? 'magic-bento-card--light' : ''}`;
  const cardStyle = {
    '--glow-color': glowColor,
    ...(isMobile ? { minHeight: '200px' } : { gridArea: gridAreas[index] || 'auto' }),
    backgroundColor: card.bgColor || 'transparent',
  } as React.CSSProperties;

  return (
    <ParticleCard
      className={baseClassName}
      style={cardStyle}
      disableAnimations={shouldDisableAnimations}
      particleCount={particleCount}
      glowColor={glowColor}
      enableTilt={enableTilt}
      clickEffect={clickEffect}
      enableMagnetism={enableMagnetism}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardCorners color={card.titleColor || card.color} isHovered={isHovered} />
      <div className="magic-bento-card__header">
        <div className="magic-bento-card__label" style={card.titleColor ? { color: card.titleColor } : undefined}>{card.label}</div>
        {card.icon && <div className="magic-bento-card__icon">{card.icon}</div>}
      </div>
      {card.description && (
        <p className="magic-bento-card__description" style={{ marginTop: 'clamp(4px, 0.8vh, 8px)', ...(card.titleColor ? { color: card.titleColor, opacity: 0.7 } : {}) }}>{card.description}</p>
      )}
      {card.customContent && (
        <div className="magic-bento-card__custom flex-1" style={{ marginTop: 'clamp(8px, 1.5vh, 16px)', marginBottom: 'clamp(8px, 1.5vh, 16px)' }}>
          {card.customContent}
        </div>
      )}
      {!hideTitle && (
        <div className="magic-bento-card__content">
          <h2 className="magic-bento-card__title" style={card.titleColor ? { color: card.titleColor } : undefined}>{card.title}</h2>
        </div>
      )}
    </ParticleCard>
  );
}

const MagicBento = ({
  cards,
  textAutoHide = true,
  hideTitle = false,
  darkMode = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true
}: MagicBentoProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  return (
    <>
      <style jsx global>{`
        .magic-bento-card {
          position: relative;
          border-radius: clamp(12px, 2vh, 20px);
          padding: clamp(16px, 2.5vh, 28px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.3s ease, border-color 0.3s ease;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          --glow-x: 50%;
          --glow-y: 50%;
          --glow-intensity: 0;
          --glow-radius: 300px;
        }
        .magic-bento-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
        }
        .magic-bento-card--border-glow::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y), rgba(var(--glow-color), calc(var(--glow-intensity) * 0.5)), transparent 50%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .magic-bento-card__header { display: flex; justify-content: space-between; align-items: flex-start; }
        .magic-bento-card__label { font-size: clamp(20px, 4vh, 40px); font-family: var(--font-bebas-neue), sans-serif; font-weight: 400; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(255, 255, 255, 0.5); }
        .magic-bento-card__icon { color: rgba(255, 255, 255, 0.5); }
        .magic-bento-card__icon svg { width: clamp(24px, 3vh, 36px); height: clamp(24px, 3vh, 36px); }
        .magic-bento-card__content { margin-top: clamp(4px, 1vh, 8px); }
        .magic-bento-card__title { font-size: clamp(24px, 4vh, 44px) !important; font-family: var(--font-bebas-neue), sans-serif; font-weight: 400; color: inherit; margin: 0 0 clamp(6px, 1vh, 12px) 0; line-height: 1; letter-spacing: 0.05em; text-transform: uppercase; }
        .magic-bento-card__description { font-size: clamp(11px, 1.5vh, 15px); font-weight: 400; margin: 0; line-height: 1.5; letter-spacing: 0.01em; }
        .magic-bento-card--text-autohide .magic-bento-card__content { opacity: 0; transform: translateY(10px); transition: opacity 0.3s ease, transform 0.3s ease; }
        .magic-bento-card--text-autohide:hover .magic-bento-card__content { opacity: 1; transform: translateY(0); }
        .particle-container { transform-style: preserve-3d; }
        .magic-bento-card--border-glow { --glow-intensity: 0; transition: --glow-intensity 0.3s ease; }
        .magic-bento-card--border-glow:hover { --glow-intensity: 1; --glow-x: 50%; --glow-y: 50%; }
        .magic-bento-card--light { border-color: rgba(0, 0, 0, 0.1); }
        .magic-bento-card--light:hover { border-color: rgba(0, 0, 0, 0.2); }
        .magic-bento-card--light .magic-bento-card__label { color: rgba(0, 0, 0, 0.5); }
        .magic-bento-card--light .magic-bento-card__description { color: rgba(0, 0, 0, 0.7); }
        .magic-bento-card--light .magic-bento-card__icon { color: rgba(0, 0, 0, 0.5); }
      `}</style>

      {enableSpotlight && <GlobalSpotlight gridRef={gridRef} disableAnimations={shouldDisableAnimations} enabled={enableSpotlight} spotlightRadius={spotlightRadius} glowColor={glowColor} />}

      <BentoCardGrid gridRef={gridRef} isMobile={isMobile}>
        {cards.map((card, index) => (
          <BentoCardWithCorners
            key={index}
            card={card}
            index={index}
            textAutoHide={textAutoHide}
            enableBorderGlow={enableBorderGlow}
            darkMode={darkMode}
            glowColor={glowColor}
            shouldDisableAnimations={shouldDisableAnimations}
            particleCount={particleCount}
            enableTilt={enableTilt}
            clickEffect={clickEffect}
            enableMagnetism={enableMagnetism}
            hideTitle={hideTitle}
            isMobile={isMobile}
          />
        ))}
      </BentoCardGrid>
    </>
  );
};

export default MagicBento;

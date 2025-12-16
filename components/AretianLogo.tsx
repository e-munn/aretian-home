"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Code, Shield, Users, Globe, Cpu, Lock,
  Zap, Heart, Eye, Wifi, Database, Building2
} from "lucide-react";

const glitchIcons = [Code, Shield, Users, Globe, Cpu, Lock, Zap, Heart, Eye, Wifi, Database, Building2];

// Aretian color palette - Prussian Blue, Jade Green, White
const colorPalette = ["#00C217", "#DBDBDB", "#FFFFFF"];

function GlitchText({
  text,
  isHovering,
}: {
  text: string;
  isHovering: boolean;
}) {
  const [glitchState, setGlitchState] = useState<(number | null)[]>(
    Array(text.length).fill(null)
  );
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const startTimeRef = useRef<number>(0);

  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, []);

  useEffect(() => {
    if (isHovering) {
      startTimeRef.current = Date.now();

      const runGlitch = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const duration = 5000;
        const progress = Math.min(elapsed / duration, 1);

        const baseInterval = 150 + (progress * progress * 500);

        if (progress < 1) {
          const numToGlitch = Math.max(1, Math.floor((1 - progress) * 2));

          setGlitchState(prev => {
            const newState = [...prev];
            for (let i = 0; i < numToGlitch; i++) {
              const idx = Math.floor(Math.random() * text.length);
              newState[idx] = Math.floor(Math.random() * glitchIcons.length);
            }
            return newState;
          });

          const resetTimeout = setTimeout(() => {
            setGlitchState(prev => {
              const reset = [...prev];
              const numToReset = Math.floor(Math.random() * 2) + 1;
              for (let i = 0; i < numToReset; i++) {
                const idx = Math.floor(Math.random() * text.length);
                reset[idx] = null;
              }
              return reset;
            });
          }, baseInterval / 2);

          timeoutRefs.current.push(resetTimeout);

          const nextTimeout = setTimeout(runGlitch, baseInterval);
          timeoutRefs.current.push(nextTimeout);
        } else {
          setGlitchState(Array(text.length).fill(null));
        }
      };

      runGlitch();
    } else {
      clearAllTimeouts();
      setGlitchState(Array(text.length).fill(null));
    }

    return clearAllTimeouts;
  }, [isHovering, text.length, clearAllTimeouts]);

  return (
    <span className="inline-flex items-center" style={{ height: '1em', lineHeight: 1, verticalAlign: 'baseline' }}>
      {text.split("").map((char, idx) => {
        const iconIdx = glitchState[idx];
        if (iconIdx !== null) {
          const Icon = glitchIcons[iconIdx];
          return (
            <span
              key={idx}
              className="inline-flex items-center justify-center"
              style={{ width: '0.65em', height: '1em', verticalAlign: 'baseline' }}
            >
              <Icon style={{ width: '0.65em', height: '0.65em' }} strokeWidth={2} />
            </span>
          );
        }
        return (
          <span
            key={idx}
            style={{ display: 'inline-block', width: char === ' ' ? '0.3em' : '0.65em', height: '1em', textAlign: 'center', verticalAlign: 'baseline' }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}

export default function AretianLogo({ darkMode = false }: { darkMode?: boolean }) {
  const [isTextHovering, setIsTextHovering] = useState(false);
  const [isIconHovering, setIsIconHovering] = useState(false);
  const [iconColorIdx, setIconColorIdx] = useState(0);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const startTimeRef = useRef<number>(0);

  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, []);

  useEffect(() => {
    if (isIconHovering) {
      startTimeRef.current = Date.now();

      const runColorCycle = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const duration = 5000;
        const progress = Math.min(elapsed / duration, 1);

        const baseInterval = 150 + (progress * progress * 500);

        if (progress < 1) {
          setIconColorIdx(Math.floor(Math.random() * 3));

          const nextTimeout = setTimeout(runColorCycle, baseInterval);
          timeoutRefs.current.push(nextTimeout);
        } else {
          setIconColorIdx(0);
        }
      };

      runColorCycle();
    } else {
      clearAllTimeouts();
      setIconColorIdx(0);
    }

    return clearAllTimeouts;
  }, [isIconHovering, clearAllTimeouts]);

  const getIconColor = () => {
    // Always start with green on dark background
    return colorPalette[iconColorIdx];
  };

  return (
    <Link href="/" className="inline-flex flex-col h-[clamp(2.5rem,5vw,3.5rem)] no-underline">
      <div className="flex items-center gap-3 h-full">
        <span
          className="bg-transparent border-none cursor-pointer flex items-center justify-center"
          onMouseEnter={() => setIsIconHovering(true)}
          onMouseLeave={() => setIsIconHovering(false)}
        >
          <Building2
            className="w-[clamp(1.75rem,4vw,2.5rem)] h-[clamp(1.75rem,4vw,2.5rem)]"
            style={{ color: getIconColor(), transition: 'color 0.1s ease' }}
            strokeWidth={1.5}
          />
        </span>
        <span
          style={{ fontSize: 'clamp(1.25rem, 3.5vw, 2rem)', lineHeight: 1, height: '1em', fontFamily: 'var(--font-geo)' }}
          className="uppercase cursor-pointer bg-transparent border-none flex items-center transition-colors duration-300 tracking-wider text-white"
          onMouseEnter={() => setIsTextHovering(true)}
          onMouseLeave={() => setIsTextHovering(false)}
        >
          <span style={{ display: 'block', height: '1em', lineHeight: 1 }}>
            <GlitchText
              text="aretian"
              isHovering={isTextHovering}
            />
          </span>
        </span>
      </div>
    </Link>
  );
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface TextPressureProps {
  text?: string;
  fontFamily?: string;
  fontUrl?: string;
  flex?: boolean;
  alpha?: boolean;
  stroke?: boolean;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  textColor?: string;
  strokeColor?: string;
  minFontSize?: number;
}

export default function TextPressure({
  text = 'Compressa',
  fontFamily = 'Compressa VF',
  fontUrl = 'https://res.cloudinary.com/dr6lvwubh/raw/upload/v1581878911/fonts/Compressa-Regular_ugwzvy.woff2',
  flex = true,
  alpha = false,
  stroke = false,
  width = true,
  weight = true,
  italic = true,
  textColor = '#ffffff',
  strokeColor = '#ff0000',
  minFontSize = 24,
}: TextPressureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const spansRef = useRef<HTMLSpanElement[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });
  const [fontSize, setFontSize] = useState(minFontSize);
  const [fontLoaded, setFontLoaded] = useState(false);

  // Load font
  useEffect(() => {
    const font = new FontFace(fontFamily, `url(${fontUrl})`);
    font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
      setFontLoaded(true);
    }).catch(() => {
      // Font failed to load, use fallback
      setFontLoaded(true);
    });
  }, [fontFamily, fontUrl]);

  // Calculate font size based on container
  useEffect(() => {
    if (!containerRef.current || !titleRef.current) return;

    const updateFontSize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      // Adjust font size to fit container width
      const newSize = Math.max(minFontSize, Math.min(containerWidth / text.length * 1.5, 200));
      setFontSize(newSize);
    };

    updateFontSize();
    window.addEventListener('resize', updateFontSize);
    return () => window.removeEventListener('resize', updateFontSize);
  }, [text, minFontSize]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    // Smooth cursor following
    mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) * 0.1;
    mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) * 0.1;

    if (!titleRef.current) return;

    spansRef.current.forEach((span) => {
      if (!span) return;

      const rect = span.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = mouseRef.current.x - centerX;
      const dy = mouseRef.current.y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 500;
      const proximity = Math.max(0, 1 - dist / maxDist);

      // Variable font settings based on proximity
      const weightVal = weight ? 100 + proximity * 800 : 400;
      const widthVal = width ? 50 + proximity * 150 : 100;
      const italicVal = italic ? proximity * 12 : 0;
      const alphaVal = alpha ? 0.3 + proximity * 0.7 : 1;

      span.style.fontVariationSettings = `"wght" ${weightVal}, "wdth" ${widthVal}, "ital" ${italicVal}`;
      span.style.opacity = alphaVal.toString();

      if (stroke) {
        span.style.webkitTextStroke = `${proximity * 2}px ${strokeColor}`;
      }
    });

    requestAnimationFrame(animate);
  }, [weight, width, italic, alpha, stroke, strokeColor]);

  useEffect(() => {
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [animate]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: flex ? 'space-between' : 'center',
      }}
    >
      <div
        ref={titleRef}
        style={{
          display: 'flex',
          justifyContent: flex ? 'space-between' : 'center',
          width: '100%',
          fontFamily: fontLoaded ? fontFamily : 'sans-serif',
          fontSize: `${fontSize}px`,
          fontWeight: 400,
          textTransform: 'uppercase',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        {text.split('').map((char, i) => (
          <span
            key={i}
            ref={(el) => { if (el) spansRef.current[i] = el; }}
            style={{
              display: 'inline-block',
              color: textColor,
              fontVariationSettings: '"wght" 100, "wdth" 50, "ital" 0',
              transition: 'none',
              willChange: 'font-variation-settings, opacity',
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}

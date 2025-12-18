'use client';

interface BlurredTextProps {
  text: string;
  fontSize: string;
  fontFamily: string;
  fontWeight: number;
  letterSpacing?: string;
  blurAmount?: number;
  className?: string;
  color?: string;
}

export function BlurredText({
  text,
  fontSize,
  fontFamily,
  fontWeight,
  letterSpacing = 'normal',
  blurAmount = 8,
  className = '',
  color = 'rgba(255, 255, 255, 0.9)',
}: BlurredTextProps) {
  const textStyle = {
    fontSize,
    fontFamily,
    fontWeight,
    letterSpacing,
    lineHeight: 0.85,
    textTransform: 'uppercase' as const,
  };

  return (
    <span className={`relative inline-block ${className}`}>
      {/* Blurred text layer behind */}
      <span
        className="absolute inset-0"
        style={{
          ...textStyle,
          color: 'rgba(255, 255, 255, 0.4)',
          filter: `blur(${blurAmount}px)`,
          transform: 'scale(1.02)',
        }}
        aria-hidden="true"
      >
        {text}
      </span>

      {/* Sharp text layer on top */}
      <span
        className="relative"
        style={{
          ...textStyle,
          color,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        {text}
      </span>
    </span>
  );
}

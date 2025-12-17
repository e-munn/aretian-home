'use client';

import Image from 'next/image';
import { ScrollVelocity } from './ScrollVelocity';

// Logo files (skipping logo_11 which was too small)
const LOGO_FILES = [
  'logo_01.png', 'logo_02.png', 'logo_03.png', 'logo_04.png',
  'logo_05.png', 'logo_06.png', 'logo_07.png', 'logo_08.png',
  'logo_09.png', 'logo_10.png', 'logo_12.png', 'logo_13.png',
  'logo_14.png', 'logo_15.png', 'logo_16.png', 'logo_17.png',
  'logo_18.png', 'logo_19.png', 'logo_20.png', 'logo_21.png',
  'logo_22.png', 'logo_23.png', 'logo_24.png', 'logo_25.png',
  'logo_26.png', 'logo_27.png', 'logo_28.png',
];

interface LogoMarqueeProps {
  velocity?: number;
  logoSize?: number;
  className?: string;
  rows?: number;
}

export function LogoMarquee({
  velocity = 50,
  logoSize = 80,
  className = '',
  rows = 2,
}: LogoMarqueeProps) {
  // Split logos into rows
  const logosPerRow = Math.ceil(LOGO_FILES.length / rows);
  const logoRows = Array.from({ length: rows }, (_, i) =>
    LOGO_FILES.slice(i * logosPerRow, (i + 1) * logosPerRow)
  );

  // Create logo elements for each row
  const createLogoElements = (logos: string[]) =>
    logos.map((logo) => (
      <div
        key={logo}
        className="flex items-center justify-center"
        style={{ width: logoSize, height: logoSize }}
      >
        <Image
          src={`/assets/logos/${logo}`}
          alt="Partner logo"
          width={logoSize}
          height={logoSize}
          className="object-contain opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
        />
      </div>
    ));

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {logoRows.map((logos, index) => (
        <ScrollVelocity
          key={index}
          texts={[createLogoElements(logos)]}
          velocity={velocity}
          numCopies={4}
          parallaxClassName="parallax"
          scrollerClassName="scroller"
          parallaxStyle={{
            padding: '1rem 0',
          }}
          scrollerStyle={{
            gap: '2rem',
          }}
        />
      ))}
    </div>
  );
}

export default LogoMarquee;

'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

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
  velocity = 30,
  logoSize = 56,
  className = '',
  rows = 2,
}: LogoMarqueeProps) {
  // Split logos into rows
  const logosPerRow = Math.ceil(LOGO_FILES.length / rows);
  const logoRows = Array.from({ length: rows }, (_, i) =>
    LOGO_FILES.slice(i * logosPerRow, (i + 1) * logosPerRow)
  );

  return (
    <div className={`flex flex-col gap-2 overflow-hidden ${className}`}>
      {logoRows.map((logos, rowIndex) => {
        // Duplicate for seamless loop
        const duplicated = [...logos, ...logos, ...logos];
        const direction = rowIndex % 2 === 0 ? -1 : 1;

        return (
          <div key={rowIndex} className="relative overflow-hidden">
            <motion.div
              className="flex items-center gap-10"
              animate={{ x: direction === -1 ? ['0%', '-33.33%'] : ['-33.33%', '0%'] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: 'loop',
                  duration: 40 - velocity * 0.3,
                  ease: 'linear',
                },
              }}
            >
              {duplicated.map((logo, i) => (
                <div
                  key={`${logo}-${i}`}
                  className="flex items-center justify-center shrink-0"
                  style={{ width: logoSize * 1.5, height: logoSize }}
                >
                  <Image
                    src={`/assets/logos/${logo}`}
                    alt="Partner logo"
                    width={logoSize * 1.5}
                    height={logoSize}
                    className="object-contain opacity-50 hover:opacity-90 transition-opacity duration-300"
                    style={{ filter: 'brightness(1.2) contrast(0.9)' }}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

export default LogoMarquee;

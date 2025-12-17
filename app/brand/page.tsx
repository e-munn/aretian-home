'use client';

import { useState } from 'react';
import { Check, Download, Home, MapPin } from 'lucide-react';
import Link from 'next/link';
import { aretianGreen, aretianBlue, aretianWhite } from '@/lib/colors';


function ColorSwatch({ hex, large = false }: { hex: string; large?: boolean }) {
  const [copied, setCopied] = useState(false);
  const isLight = hex === '#FFFFFF' || hex === '#FFF6EF' || hex.toLowerCase() >= '#aaaaaa';

  const copyHex = async () => {
    await navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copyHex}
      className={`group relative w-full h-full rounded-lg flex items-center justify-center transition-transform hover:scale-105 cursor-pointer border-0 ${isLight ? 'ring-1 ring-white/20' : ''}`}
      style={{ backgroundColor: hex }}
    >
      {copied ? (
        <Check className={`w-4 h-4 ${isLight ? 'text-black' : 'text-white'}`} />
      ) : (
        <span className={`${large ? 'text-sm' : 'text-[10px]'} font-mono opacity-60 group-hover:opacity-100 transition-opacity ${isLight ? 'text-black' : 'text-white'}`}>
          {hex}
        </span>
      )}
    </button>
  );
}

// Helper to determine if a color is light
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

// Color palette component like Tailwind docs
function ColorPalette({
  name,
  colors
}: {
  name: string;
  colors: Record<number, string>;
}) {
  const [copiedKey, setCopiedKey] = useState<number | null>(null);
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  const copyHex = async (key: number, hex: string) => {
    await navigator.clipboard.writeText(hex);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-white/40">{name}</span>
      <div className="flex gap-0.5 h-10">
        {shades.map((shade) => {
          const hex = colors[shade];
          const light = isLightColor(hex);
          return (
            <button
              key={shade}
              onClick={() => copyHex(shade, hex)}
              className="flex-1 relative group cursor-pointer border-0 first:rounded-l-md last:rounded-r-md transition-transform hover:scale-y-110 hover:z-10"
              style={{ backgroundColor: hex }}
              title={`${shade}: ${hex}`}
            >
              {copiedKey === shade ? (
                <Check className={`w-3 h-3 absolute inset-0 m-auto ${light ? 'text-black' : 'text-white'}`} />
              ) : (
                <span className={`absolute inset-0 flex items-center justify-center text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity ${light ? 'text-black' : 'text-white'}`}>
                  {shade}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Logo mark - city grid icon
function LogoMark({ bg, logoColor }: { bg: string; logoColor: string }) {
  return (
    <div
      className="aspect-square rounded-xl flex items-center justify-center"
      style={{ backgroundColor: bg }}
    >
      <svg width="60%" height="60%" viewBox="0 0 100 100" fill="none">
        {/* Grid pattern representing city blocks */}
        <rect x="10" y="10" width="25" height="35" rx="2" fill={logoColor} opacity="0.9" />
        <rect x="40" y="10" width="25" height="20" rx="2" fill={logoColor} opacity="0.7" />
        <rect x="70" y="10" width="20" height="45" rx="2" fill={logoColor} opacity="0.8" />
        <rect x="10" y="50" width="25" height="40" rx="2" fill={logoColor} opacity="0.7" />
        <rect x="40" y="35" width="25" height="55" rx="2" fill={logoColor} opacity="0.9" />
        <rect x="70" y="60" width="20" height="30" rx="2" fill={logoColor} opacity="0.6" />
      </svg>
    </div>
  );
}

// Alternative logo - network nodes
function LogoMarkNetwork({ bg, logoColor }: { bg: string; logoColor: string }) {
  return (
    <div
      className="aspect-square rounded-xl flex items-center justify-center"
      style={{ backgroundColor: bg }}
    >
      <svg width="60%" height="60%" viewBox="0 0 100 100" fill="none">
        {/* Network nodes */}
        <circle cx="50" cy="30" r="8" fill={logoColor} />
        <circle cx="25" cy="60" r="8" fill={logoColor} />
        <circle cx="75" cy="60" r="8" fill={logoColor} />
        <circle cx="50" cy="80" r="6" fill={logoColor} opacity="0.6" />
        {/* Connections */}
        <line x1="50" y1="38" x2="30" y2="54" stroke={logoColor} strokeWidth="2" opacity="0.5" />
        <line x1="50" y1="38" x2="70" y2="54" stroke={logoColor} strokeWidth="2" opacity="0.5" />
        <line x1="33" y1="60" x2="67" y2="60" stroke={logoColor} strokeWidth="2" opacity="0.5" />
        <line x1="50" y1="74" x2="30" y2="66" stroke={logoColor} strokeWidth="2" opacity="0.3" />
        <line x1="50" y1="74" x2="70" y2="66" stroke={logoColor} strokeWidth="2" opacity="0.3" />
      </svg>
    </div>
  );
}

export default function BrandPage() {
  return (
    <main className="h-screen bg-[#0a0a12] overflow-hidden flex flex-col">
      {/* Navigation */}
      <div className="px-6 py-4 shrink-0 flex items-center justify-between">
        <Link
          href="/"
          className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/60 hover:text-white"
        >
          <Home className="w-5 h-5" />
        </Link>
        <span className="text-white/40 text-sm">Brand Guidelines</span>
        <div className="w-9" />
      </div>

      {/* Bento Grid Content */}
      <div className="flex-1 px-6 pb-6 min-h-0">
        <div className="h-full max-w-6xl mx-auto grid grid-cols-12 grid-rows-6 gap-3">

          {/* Logo variants - large */}
          <div className="col-span-6 row-span-3 bg-white/5 rounded-2xl p-4 flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Logo — City Grid</span>
            <div className="flex-1 grid grid-cols-3 gap-3">
              <LogoMark bg="#0f0f1a" logoColor="#00C217" />
              <LogoMark bg="#FFFFFF" logoColor="#0f0f1a" />
              <LogoMark bg="#00C217" logoColor="#0f0f1a" />
            </div>
          </div>

          {/* Wordmark large */}
          <div className="col-span-6 row-span-2 bg-[#0f0f1a] rounded-2xl flex items-center justify-center border border-white/10">
            <span className="text-5xl font-bold tracking-wider text-white">ARETIAN</span>
          </div>

          {/* Color Palettes */}
          <div className="col-span-6 row-span-2 bg-white/5 rounded-2xl p-4 flex flex-col gap-3">
            <span className="text-[10px] uppercase tracking-wider text-white/40">Color Palettes — 50 to 950</span>
            <ColorPalette name="Green" colors={aretianGreen} />
            <ColorPalette name="Blue" colors={aretianBlue} />
            <ColorPalette name="White" colors={aretianWhite} />
          </div>

          {/* Network logo variant */}
          <div className="col-span-3 row-span-2 bg-white/5 rounded-2xl p-4 flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Logo — Network</span>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <LogoMarkNetwork bg="#0f0f1a" logoColor="#00C217" />
              <LogoMarkNetwork bg="#00C217" logoColor="#0f0f1a" />
            </div>
          </div>

          {/* Typography */}
          <div className="col-span-3 row-span-2 bg-white/5 rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Typography</span>
            <p className="text-3xl font-bold tracking-wider text-white">ARETIAN</p>
            <p className="text-sm text-white/50 mt-1">Bold, uppercase, wide tracking</p>
          </div>

          {/* Wordmarks row */}
          <div className="col-span-2 row-span-1 bg-[#0f0f1a] rounded-xl flex items-center justify-center border border-white/10">
            <span className="text-lg font-bold tracking-wider text-white">ARETIAN</span>
          </div>
          <div className="col-span-2 row-span-1 bg-white rounded-xl flex items-center justify-center">
            <span className="text-lg font-bold tracking-wider text-[#0f0f1a]">ARETIAN</span>
          </div>
          <div className="col-span-2 row-span-1 bg-[#00C217] rounded-xl flex items-center justify-center">
            <span className="text-lg font-bold tracking-wider text-[#0f0f1a]">ARETIAN</span>
          </div>

          {/* Buttons */}
          <div className="col-span-3 row-span-2 bg-white/5 rounded-2xl p-4 flex flex-col justify-center gap-3">
            <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Buttons</span>
            <button className="bg-[#00C217] text-black px-4 py-2 text-sm font-medium rounded-xl">
              Primary Action
            </button>
            <button className="bg-white/10 text-white px-4 py-2 text-sm font-medium rounded-xl border border-white/10">
              Secondary
            </button>
          </div>

          {/* Tags/Labels */}
          <div className="col-span-3 row-span-2 bg-white/5 rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Labels</span>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-[#00C217]/20 text-[#00C217] rounded-full text-xs font-medium">Urban</span>
              <span className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-xs font-medium">Analytics</span>
              <span className="px-3 py-1 bg-[#424162] text-white/80 rounded-full text-xs font-medium">Design</span>
              <span className="px-3 py-1 border border-white/20 text-white/60 rounded-full text-xs font-medium">City</span>
            </div>
          </div>

          {/* Location badge */}
          <div className="col-span-2 row-span-1 bg-[#424162] rounded-xl flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/80">Barcelona</span>
          </div>
          <div className="col-span-2 row-span-1 bg-[#1B283B] rounded-xl flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/80">Boston</span>
          </div>
          <div className="col-span-2 row-span-1 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
            <span className="text-xs text-white/40">Harvard SEAS 2018</span>
          </div>

          {/* Mission statement */}
          <div className="col-span-6 row-span-1 bg-white/5 rounded-xl p-4 flex items-center border border-white/10">
            <p className="text-sm text-white/60 leading-relaxed">
              <span className="text-white/80">Areté (ἀρετή)</span> — Ancient Greek concept of excellence.
              We help cities excel at their duty through complexity science and network theory.
            </p>
          </div>

          {/* Download */}
          <div className="col-span-3 row-span-1 bg-[#00C217] rounded-xl flex items-center justify-center cursor-pointer hover:bg-[#00a813] transition-colors">
            <Download className="w-4 h-4 text-black mr-2" />
            <span className="text-sm font-medium text-black">Download Assets</span>
          </div>

          {/* Spacing */}
          <div className="col-span-3 row-span-1 bg-white/5 rounded-xl p-3 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-white/40">Spacing</span>
            <div className="flex gap-1 items-end">
              {[4, 8, 16, 24, 32].map((s) => (
                <div key={s} className="bg-[#00C217]/30 border border-[#00C217]/50" style={{ width: s/2, height: s/2 }} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

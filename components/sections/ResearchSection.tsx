'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpen, Globe2, Building2, Route, Play, ExternalLink, ShoppingCart } from 'lucide-react';
import { Visible } from '@/components/layout/Visible';

// Video links
const VIDEOS = [
  {
    id: '4SP2ZedZN_8',
    title: 'City Science Overview',
    url: 'https://www.youtube.com/watch?v=4SP2ZedZN_8',
  },
  {
    id: '1kAM0OWnAnY',
    title: 'Urban Analytics',
    url: 'https://www.youtube.com/watch?v=1kAM0OWnAnY',
  },
  {
    id: 'S-mHB2fmyak',
    title: 'Innovation Districts',
    url: 'https://www.youtube.com/watch?v=S-mHB2fmyak',
  },
];

// Book cover image
const BOOK_COVER_URL = '/assets/research/city-science-book.jpg';

// Book data
const BOOK = {
  tag: '2024 Publication',
  title: 'City Science',
  subtitle: 'Performance Follows Form',
  description: 'A study of 100 urban environments across five continents examining urban design and quality of life.',
  highlights: [
    { icon: Globe2, stat: '100', label: 'Cities' },
    { icon: Building2, stat: '5', label: 'Continents' },
    { icon: Route, stat: '15min', label: 'Standards' },
  ],
  ctaUrl: 'https://actar.com/product/city-science/',
};

function BookDisplay() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-12"
    >
      {/* Book Cover */}
      <div className="relative">
        <div
          className="absolute -left-3 top-3 bottom-3 w-3 rounded-l-sm"
          style={{ background: 'linear-gradient(to right, #1a1a1a, #0a0a0a)' }}
        />
        <div
          className="relative w-48 h-64 overflow-hidden shadow-2xl rounded-r-md"
          style={{ boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.6)' }}
        >
          <Image
            src={BOOK_COVER_URL}
            alt={BOOK.title}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Book Info */}
      <div className="flex flex-col">
        {/* Tag */}
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} className="text-[#00C217]" />
          <span className="text-[#00C217] text-xs uppercase tracking-[0.2em] font-medium">
            {BOOK.tag}
          </span>
        </div>

        {/* Title */}
        <h2
          className="text-white text-5xl uppercase tracking-wide mb-1"
          style={{ fontFamily: 'var(--font-bebas-neue)' }}
        >
          {BOOK.title}
        </h2>
        <p className="text-white/50 text-lg mb-3">{BOOK.subtitle}</p>

        {/* Description */}
        <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-md">
          {BOOK.description}
        </p>

        {/* Stats */}
        <div className="flex gap-8 mb-6">
          {BOOK.highlights.map((highlight) => (
            <div key={highlight.label} className="text-center">
              <p
                className="text-white text-2xl"
                style={{ fontFamily: 'var(--font-bebas-neue)' }}
              >
                {highlight.stat}
              </p>
              <p className="text-white/40 text-[10px] uppercase tracking-wider">
                {highlight.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={BOOK.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-[#00C217]/30 bg-[#00C217]/10 hover:bg-[#00C217]/20 hover:border-[#00C217]/50 transition-all group w-fit"
        >
          <ShoppingCart size={18} className="text-[#00C217]" />
          <span className="text-[#00C217] text-base font-medium">Buy on Actar</span>
          <ExternalLink size={14} className="text-[#00C217]/60 group-hover:text-[#00C217] transition-colors" />
        </a>
      </div>
    </motion.div>
  );
}

function VideoLinks() {
  return (
    <div className="flex items-center justify-center gap-4 px-8">
      {VIDEOS.map((video, i) => (
        <motion.a
          key={video.id}
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
          className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
        >
          {/* Thumbnail */}
          <div className="relative w-52 h-32 md:w-64 md:h-36">
            <Image
              src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
              alt={video.title}
              fill
              className="object-cover"
            />
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
              <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play size={14} className="text-black ml-0.5" fill="currentColor" />
              </div>
            </div>
          </div>
          {/* Title */}
          <div className="p-2 flex items-center justify-between gap-2">
            <span className="text-white/70 text-[10px] font-medium truncate">{video.title}</span>
            <ExternalLink size={10} className="text-white/40 shrink-0" />
          </div>
        </motion.a>
      ))}
    </div>
  );
}

export function ResearchSection() {
  return (
    <div className="w-full h-full bg-transparent relative overflow-hidden">
      <Visible>
        <div className="w-full h-full flex flex-col items-center justify-center gap-10">
          <BookDisplay />
          <VideoLinks />
        </div>
      </Visible>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Globe2, Building2, Route, Play, ExternalLink, ShoppingCart, Download, Briefcase, Lightbulb, LineChart, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
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

// Books data
const BOOKS = [
  {
    id: 'city-science',
    coverUrl: '/assets/research/city-science-book.jpg',
    tag: '2024 Publication',
    tagIcon: BookOpen,
    title: 'City Science',
    subtitle: 'Performance Follows Form',
    description: 'A study of 100 urban environments across five continents examining urban design and quality of life.',
    highlights: [
      { icon: Globe2, stat: '100', label: 'Cities' },
      { icon: Building2, stat: '5', label: 'Continents' },
      { icon: Route, stat: '15min', label: 'Standards' },
    ],
    ctaLabel: 'Buy on Actar',
    ctaIcon: ShoppingCart,
    ctaUrl: 'https://actar.com/product/city-science/',
  },
  {
    id: 'barcelona-report',
    coverUrl: '/assets/research/barcelona-report.jpg',
    tag: 'Strategic Report',
    tagIcon: FileText,
    title: "A Vision for Barcelona's Future",
    subtitle: 'City science illuminating urban and economic development',
    description: 'Strategic framework for sustainable growth developed with Torras Family Foundation and IESE Business School.',
    highlights: [
      { icon: Briefcase, stat: '75K', label: 'Jobs' },
      { icon: LineChart, stat: '€65B', label: 'Revenue' },
      { icon: Lightbulb, stat: '350', label: 'Industries' },
    ],
    ctaLabel: 'Download Report',
    ctaIcon: Download,
    ctaUrl: '#',
  },
];

function BookDisplay({ book }: { book: typeof BOOKS[0] }) {
  const TagIcon = book.tagIcon;
  const CtaIcon = book.ctaIcon;

  return (
    <motion.div
      key={book.id}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
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
            src={book.coverUrl}
            alt={book.title}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Book Info */}
      <div className="flex flex-col">
        {/* Tag */}
        <div className="flex items-center gap-2 mb-3">
          <TagIcon size={16} className="text-[#00C217]" />
          <span className="text-[#00C217] text-xs uppercase tracking-[0.2em] font-medium">
            {book.tag}
          </span>
        </div>

        {/* Title */}
        <h2
          className="text-white text-5xl uppercase tracking-wide mb-1"
          style={{ fontFamily: 'var(--font-bebas-neue)' }}
        >
          {book.title}
        </h2>
        <p className="text-white/50 text-lg mb-3">{book.subtitle}</p>

        {/* Description */}
        <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-md">
          {book.description}
        </p>

        {/* Stats */}
        <div className="flex gap-8 mb-6">
          {book.highlights.map((highlight) => (
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
          href={book.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-[#00C217]/30 bg-[#00C217]/10 hover:bg-[#00C217]/20 hover:border-[#00C217]/50 transition-all group w-fit"
        >
          <CtaIcon size={18} className="text-[#00C217]" />
          <span className="text-[#00C217] text-base font-medium">{book.ctaLabel}</span>
          <ExternalLink size={14} className="text-[#00C217]/60 group-hover:text-[#00C217] transition-colors" />
        </a>
      </div>
    </motion.div>
  );
}

function BookCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % BOOKS.length);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + BOOKS.length) % BOOKS.length);

  return (
    <div className="relative flex items-center gap-8">
      {/* Left Arrow */}
      <button
        onClick={goPrev}
        className="p-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all"
      >
        <ChevronLeft size={24} className="text-white/60" />
      </button>

      {/* Book Display */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <BookDisplay book={BOOKS[currentIndex]} />
        </AnimatePresence>
      </div>

      {/* Right Arrow */}
      <button
        onClick={goNext}
        className="p-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all"
      >
        <ChevronRight size={24} className="text-white/60" />
      </button>

      {/* Dots indicator */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {BOOKS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-[#00C217] w-4' : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
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
        <div className="w-full h-full flex flex-col items-center justify-center gap-28">
          <BookCarousel />
          <VideoLinks />
        </div>
      </Visible>
    </div>
  );
}

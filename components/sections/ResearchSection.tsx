'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpen, Globe2, Building2, Route, Play, ExternalLink, ShoppingCart, Download, Briefcase, Lightbulb, LineChart, Home, FileText } from 'lucide-react';
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

// Barcelona report cover
const REPORT_COVER_URL = '/assets/research/barcelona-report.jpg';

// Research items data
const RESEARCH_ITEMS = [
  {
    id: 'book',
    type: 'book',
    tag: '2024 Publication',
    tagIcon: BookOpen,
    title: 'City Science: Performance Follows Form',
    description: 'An extended study of 100 urban environments and metropolitan areas across five continents. We compare urban performance—the quality of architectural and urban design characteristics, civil engineering infrastructures, and their impact on citizens\' quality of life.',
    secondaryDescription: 'City Science tackles pressing questions in modern urbanism: Can cities meet 15-minute city standards? How do they shape a thriving knowledge economy? What makes an efficient intermodal mobility system?',
    coverUrl: BOOK_COVER_URL,
    highlights: [
      { icon: Globe2, stat: '100', label: 'Cities Studied' },
      { icon: Building2, stat: '5', label: 'Continents' },
      { icon: Route, stat: '15min', label: 'City Standards' },
    ],
    cta: {
      label: 'Buy on Actar',
      url: 'https://actar.com/product/city-science/',
      icon: ShoppingCart,
    },
  },
  {
    id: 'barcelona-report',
    type: 'report',
    tag: 'Strategic Report',
    tagIcon: FileText,
    title: 'A Vision for Barcelona\'s Future',
    description: 'Data-driven strategies for sustainable growth and innovation in global cities. By comparing five leading cities—Amsterdam, Barcelona, Boston, Munich, and Stockholm—this study provides a strategic framework for addressing urban challenges and unlocking economic potential.',
    secondaryDescription: 'Developed by Aretian in an initiative supported by the Torras Family Foundation and IESE Business School. By 2040, the Barcelona Metropolitan Region can achieve transformative growth.',
    coverUrl: REPORT_COVER_URL,
    highlights: [
      { icon: Briefcase, stat: '75K', label: 'New Jobs' },
      { icon: LineChart, stat: '€65B', label: 'Revenue Growth' },
      { icon: Lightbulb, stat: '350', label: 'New Industries' },
      { icon: Home, stat: '676K', label: 'Housing Access' },
    ],
    cta: {
      label: 'Download Report',
      url: '#', // Replace with actual download URL
      icon: Download,
    },
  },
];

function ResearchList() {
  return (
    <div className="w-full max-w-5xl px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {RESEARCH_ITEMS.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
          >
            {/* Cover */}
            <div className="relative mb-6">
              {/* Spine shadow for book */}
              {item.type === 'book' && (
                <div
                  className="absolute -left-2 top-2 bottom-2 w-2 rounded-l-sm"
                  style={{ background: 'linear-gradient(to right, #1a1a1a, #0a0a0a)' }}
                />
              )}
              <div
                className={`relative w-36 h-48 md:w-40 md:h-52 overflow-hidden shadow-2xl ${item.type === 'book' ? 'rounded-r-md' : 'rounded-lg'}`}
                style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1)' }}
              >
                <Image
                  src={item.coverUrl}
                  alt={item.title}
                  fill
                  className="object-cover z-10"
                />
              </div>
            </div>

            {/* Tag */}
            <div className="flex items-center gap-2 mb-3">
              <item.tagIcon size={14} className="text-[#00C217]" />
              <span className="text-[#00C217] text-xs uppercase tracking-[0.2em] font-medium">
                {item.tag}
              </span>
            </div>

            {/* Title */}
            <h2
              className="text-white text-2xl md:text-3xl uppercase tracking-wide mb-3"
              style={{ fontFamily: 'var(--font-bebas-neue)' }}
            >
              {item.title}
            </h2>

            {/* Description */}
            <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-3">
              {item.description}
            </p>

            {/* Stats */}
            <div className="flex gap-4 mb-5">
              {item.highlights.slice(0, 3).map((highlight) => (
                <div key={highlight.label} className="text-center">
                  <p
                    className="text-white text-lg"
                    style={{ fontFamily: 'var(--font-bebas-neue)' }}
                  >
                    {highlight.stat}
                  </p>
                  <p className="text-white/40 text-[9px] uppercase tracking-wider">
                    {highlight.label}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href={item.cta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00C217]/30 bg-[#00C217]/10 hover:bg-[#00C217]/20 hover:border-[#00C217]/50 transition-all group"
            >
              <item.cta.icon size={14} className="text-[#00C217]" />
              <span className="text-[#00C217] text-sm font-medium">{item.cta.label}</span>
              <ExternalLink size={12} className="text-[#00C217]/60 group-hover:text-[#00C217] transition-colors" />
            </a>
          </motion.div>
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
        <div className="w-full h-full flex flex-col items-center justify-center gap-8">
          <ResearchList />
          <div className="mt-4">
            <VideoLinks />
          </div>
        </div>
      </Visible>
    </div>
  );
}

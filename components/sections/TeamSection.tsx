'use client';

import { motion } from 'framer-motion';
import { MoreHorizontal, LayoutGrid, List } from 'lucide-react';
import { useState } from 'react';
import { Visible } from '@/components/layout/Visible';

// Partner and client names as arrays for badge rendering
const PARTNERS_ROW_1 = [
  'Harvard GSD',
  'MIT Media Lab',
  'Barcelona City Council',
  'Massachusetts Port Authority',
  'World Bank',
  'Inter-American Development Bank',
];
const PARTNERS_ROW_2 = [
  'Bloomberg Associates',
  'Sidewalk Labs',
  'Amazon Web Services',
  'Microsoft Research',
  'Urban Land Institute',
  'ESRI',
];

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  location?: string;
  color: string;
  initials: string;
  image?: string;
}

const TEAM: TeamMember[] = [
  {
    name: 'Ramon Gras Alomà',
    role: 'Co-Founder & CEO',
    bio: 'City Science researcher at Harvard. Combines cutting-edge research with building Aretian to help cities unlock their potential.',
    color: '#00C217',
    initials: 'RG',
    image: '/team/ramon-gras.jpg',
  },
  {
    name: 'Gauthier de La Ville-Baugé',
    role: 'Director of Operations',
    bio: 'Leads project management and operations, ensuring seamless delivery of urban analytics solutions.',
    color: '#3b82f6',
    initials: 'GV',
    image: '/team/gauthier.jpg',
  },
  {
    name: 'Fanny Magini',
    role: 'Director of Business Development',
    bio: 'Drives strategic partnerships and business growth, connecting Aretian with cities and organizations worldwide.',
    color: '#8b5cf6',
    initials: 'FM',
    image: '/team/fanny-magini.jpg',
  },
  {
    name: 'Fernando Yu',
    role: 'Economist',
    bio: 'Economic analysis and urban development strategy. Focuses on the intersection of spatial design and economic performance.',
    color: '#f59e0b',
    initials: 'FY',
    image: '/team/fernando-yu.jpg',
  },
  {
    name: 'Céleste Richard',
    role: 'Project Manager',
    bio: 'Coordinates urban design initiatives and ensures projects deliver actionable insights for cities.',
    color: '#ec4899',
    initials: 'CR',
    image: '/team/celeste-richard.jpg',
  },
  {
    name: 'Elijah Munn',
    role: 'Senior Product Developer',
    bio: 'Builds innovative digital tools and platforms that power Aretian\'s urban analytics solutions.',
    color: '#14b8a6',
    initials: 'EM',
    image: '/team/elijah-munn.jpg',
  },
  {
    name: 'Pablo Rocabert',
    role: 'Urban Designer',
    bio: 'Creates spatial designs and visualizations that translate complex urban data into clear, actionable plans.',
    color: '#f97316',
    initials: 'PR',
    image: '/team/pablo-rocabert.jpg',
  },
  {
    name: 'Nikhil Desai',
    role: 'Senior Data Scientist',
    bio: 'Develops advanced analytics and machine learning models to uncover patterns in urban systems.',
    color: '#6366f1',
    initials: 'ND',
    image: '/team/nikhil-desai.png',
  },
  {
    name: 'Bernat Salvanyà-Rovira',
    role: 'PhD & Researcher',
    bio: 'Conducts cutting-edge research in urban science and complexity, advancing the theoretical foundations of urban analytics.',
    color: '#ef4444',
    initials: 'BS',
    image: '/team/bernat-salvanya.png',
  },
];

// Partners Badge Marquee component - matching Awards style
function PartnersBadgeMarquee() {
  const renderRow = (partners: string[], direction: 1 | -1, rowIndex: number) => {
    const duplicated = [...partners, ...partners, ...partners];
    return (
      <div className="relative overflow-hidden">
        <motion.div
          className="flex items-center gap-4"
          animate={{ x: direction === -1 ? ['0%', '-33.33%'] : ['-33.33%', '0%'] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 25,
              ease: 'linear',
            },
          }}
        >
          {duplicated.map((partner, i) => (
            <div
              key={`${rowIndex}-${i}`}
              className="flex items-center gap-2 shrink-0 p-1.5 px-4 rounded-full border border-white/10 bg-white/[0.03]"
            >
              <span className="text-white/80 text-sm md:text-base whitespace-nowrap font-medium">
                {partner}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {renderRow(PARTNERS_ROW_1, -1, 0)}
      {renderRow(PARTNERS_ROW_2, 1, 1)}
    </div>
  );
}

// Cards View - Profile cards in a grid
function CardsView({ members }: { members: TeamMember[] }) {
  return (
    <div className="h-full p-6 md:p-8">
      <div
        className="h-full grid gap-3"
        style={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
        }}
      >
        {members.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group relative rounded-xl p-5 flex flex-col text-left transition-all hover:scale-[1.02] overflow-hidden"
            style={{
              backgroundColor: `${member.color}10`,
              border: `1px solid ${member.color}25`,
            }}
          >
            {/* Avatar and Name row */}
            <div className="flex items-center gap-3 mb-3">
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                  style={{ border: `2px solid ${member.color}40` }}
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0"
                  style={{ background: `${member.color}40` }}
                >
                  {member.initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3
                  className="text-lg md:text-xl leading-tight uppercase tracking-wide text-white/90"
                  style={{ fontFamily: 'var(--font-bebas-neue)' }}
                >
                  {member.name}
                </h3>
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: member.color }}
                >
                  {member.role}
                </span>
              </div>
            </div>

            {/* Bio */}
            <p
              className="text-[11px] leading-relaxed text-white/50 flex-1 overflow-hidden"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {member.bio}
            </p>

            {/* Accent line at bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5 opacity-50"
              style={{ background: `linear-gradient(90deg, ${member.color}, transparent)` }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// List View - Minimal horizontal layout
function ListView({ members }: { members: TeamMember[] }) {
  return (
    <div className="relative h-full overflow-hidden">
      {/* Scrollable content */}
      <div
        className="h-full px-8 pt-8 pb-24 overflow-y-auto scrollbar-hide relative z-0"
        style={{ overscrollBehavior: 'contain' }}
        data-scrollable
      >
        <div className="max-w-5xl mx-auto flex flex-col justify-start">
          {members.map((member, i) => (
            <div key={member.name}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-start gap-6 py-5 group hover:bg-white/5 px-4 -mx-4 rounded-lg transition-colors"
              >
              {/* Avatar - fixed width */}
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                  style={{ border: `2px solid ${member.color}30` }}
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: `${member.color}30` }}
                >
                  {member.initials}
                </div>
              )}

              {/* Name - fixed width */}
              <div className="w-80 shrink-0">
                <h3
                  className="text-white text-xl md:text-2xl uppercase tracking-wide leading-tight"
                  style={{ fontFamily: 'var(--font-bebas-neue)' }}
                >
                  {member.name}
                </h3>
              </div>

              {/* Role - fixed width */}
              <div className="w-48 shrink-0">
                <span className="text-white/50 text-sm">
                  {member.role}
                </span>
              </div>

              {/* Bio - icon with tooltip */}
              <div className="relative shrink-0 ml-auto">
                <div className="peer p-2 rounded-full hover:bg-white/10 cursor-pointer transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-white/40 group-hover:text-white/60" />
                </div>
                <div
                  className="absolute right-0 top-full mt-2 w-72 p-4 rounded-xl bg-[#1a1a2e]/95 backdrop-blur-sm border border-white/10 shadow-xl opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all duration-200 z-50"
                >
                  <p className="text-white/80 text-sm leading-relaxed">{member.bio}</p>
                  <div className="absolute -top-2 right-4 w-4 h-4 bg-[#1a1a2e]/95 border-l border-t border-white/10 rotate-45" />
                </div>
              </div>
              </motion.div>
              {/* Separator line */}
              <div className="h-px bg-white/10 mx-4" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to top, #0f0f1a 0%, #0f0f1a 20%, transparent 100%)',
        }}
      />
    </div>
  );
}

export function TeamSection() {
  const [view, setView] = useState<'cards' | 'list'>('cards');

  return (
    <section
      id="team"
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* View toggle */}
      <div className="absolute top-6 right-6 z-10 flex gap-1 p-1.5 rounded-xl bg-black/40 border border-white/20 backdrop-blur-sm">
        <button
          onClick={() => setView('cards')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${view === 'cards' ? 'bg-white/15 text-white shadow-lg' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
          title="Cards view"
        >
          <LayoutGrid size={18} />
          <span className="text-xs font-medium uppercase tracking-wide">Cards</span>
        </button>
        <button
          onClick={() => setView('list')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${view === 'list' ? 'bg-white/15 text-white shadow-lg' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
          title="List view"
        >
          <List size={18} />
          <span className="text-xs font-medium uppercase tracking-wide">List</span>
        </button>
      </div>

      <Visible>
        <div className="w-full h-full pb-56">
          {/* Team view - takes full height minus partners */}
          {view === 'cards' ? (
            <CardsView members={TEAM} />
          ) : (
            <ListView members={TEAM} />
          )}
        </div>
      </Visible>

      {/* Partners banner - outside Visible for full width */}
      <div className="absolute bottom-0 left-0 right-0 h-56 flex flex-col justify-center w-full bg-[#0f0f1a]/80 backdrop-blur-md z-10 overflow-hidden">
        <p className="text-white/80 text-sm md:text-base pb-4 uppercase tracking-widest px-8 text-right flex items-center justify-end gap-2">
          <span className="text-base md:text-lg leading-none relative -top-1">:</span>
          <span className="border-b-2 border-white/20 pb-1">Partners & Clients</span>
        </p>
        <PartnersBadgeMarquee />
        {/* Gradient overlay - fades from solid on left to transparent on right */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, #0f0f1a 0%, #0f0f1a 15%, rgba(15,15,26,0.8) 25%, rgba(15,15,26,0) 40%, transparent 100%)',
            zIndex: 50,
          }}
        />
      </div>
    </section>
  );
}

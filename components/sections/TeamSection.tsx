'use client';

import { motion } from 'framer-motion';
import { Visible } from '@/components/layout/Visible';
import { TeamMemberCard } from '@/components/ui/TeamMemberCard';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  initials: string;
  image?: string;
}

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

// Unified accent color for all team cards
const TEAM_ACCENT_COLOR = '#00C217';

const TEAM: TeamMember[] = [
  {
    name: 'Ramon Gras Alomà',
    role: 'Co-Founder & CEO',
    bio: 'City Science researcher at Harvard. Combines cutting-edge research with building Aretian to help cities unlock their potential.',
    initials: 'RG',
    image: '/team/ramon-gras.jpg',
  },
  {
    name: 'Gauthier de La Ville-Baugé',
    role: 'Director of Operations',
    bio: 'Leads project management and operations, ensuring seamless delivery of urban analytics solutions.',
    initials: 'GV',
    image: '/team/gauthier.jpg',
  },
  {
    name: 'Fanny Magini',
    role: 'Director of Business Development',
    bio: 'Drives strategic partnerships and business growth, connecting Aretian with cities and organizations worldwide.',
    initials: 'FM',
    image: '/team/fanny-magini.jpg',
  },
  {
    name: 'Fernando Yu',
    role: 'Economist',
    bio: 'Economic analysis and urban development strategy. Focuses on the intersection of spatial design and economic performance.',
    initials: 'FY',
    image: '/team/fernando-yu.jpg',
  },
  {
    name: 'Céleste Richard',
    role: 'Project Manager',
    bio: 'Coordinates urban design initiatives and ensures projects deliver actionable insights for cities.',
    initials: 'CR',
    image: '/team/celeste-richard.jpg',
  },
  {
    name: 'Elijah Munn',
    role: 'Senior Product Developer',
    bio: 'Builds innovative digital tools and platforms that power Aretian\'s urban analytics solutions.',
    initials: 'EM',
    image: '/team/elijah-munn.jpg',
  },
  {
    name: 'Pablo Rocabert',
    role: 'Urban Designer',
    bio: 'Creates spatial designs and visualizations that translate complex urban data into clear, actionable plans.',
    initials: 'PR',
    image: '/team/pablo-rocabert.jpg',
  },
  {
    name: 'Nikhil Desai',
    role: 'Senior Data Scientist',
    bio: 'Develops advanced analytics and machine learning models to uncover patterns in urban systems.',
    initials: 'ND',
    image: '/team/nikhil-desai.png',
  },
  {
    name: 'Bernat Salvanyà-Rovira',
    role: 'PhD & Researcher',
    bio: 'Conducts cutting-edge research in urban science and complexity, advancing the theoretical foundations of urban analytics.',
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

// Team Cards Grid - scrollable portrait cards
function TeamCardsGrid({ members }: { members: TeamMember[] }) {
  return (
    <div className="relative h-full overflow-hidden">
      <div
        className="h-full px-8 pt-10 pb-8 overflow-y-auto scrollbar-hide"
        style={{ overscrollBehavior: 'contain' }}
        data-scrollable
      >
        <div className="flex flex-wrap justify-center gap-6 pb-8">
          {members.map((member, i) => (
            <TeamMemberCard
              key={member.name}
              member={member}
              index={i}
              accentColor={TEAM_ACCENT_COLOR}
            />
          ))}
        </div>
      </div>

      {/* Bottom fade gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to top, #0f0f1a 0%, #0f0f1a 30%, transparent 100%)',
        }}
      />
    </div>
  );
}

export function TeamSection() {
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
      <Visible>
        <div className="w-full h-full pb-56">
          <TeamCardsGrid members={TEAM} />
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

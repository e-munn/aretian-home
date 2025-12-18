'use client';

import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { Visible } from '@/components/layout/Visible';
import ScrollVelocity from '@/components/ScrollVelocity';

// Partner and client names
const PARTNERS_ROW_1 = 'Harvard GSD  •  MIT Media Lab  •  Barcelona City Council  •  Massachusetts Port Authority  •  World Bank  •  Inter-American Development Bank';
const PARTNERS_ROW_2 = 'Bloomberg Associates  •  Sidewalk Labs  •  Amazon Web Services  •  Microsoft Research  •  Urban Land Institute  •  ESRI';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  location?: string;
  color: string;
  initials: string;
}

const TEAM: TeamMember[] = [
  {
    name: 'Ramon Gras Alomà',
    role: 'Co-Founder & CEO',
    bio: 'City Science researcher at Harvard. Combines cutting-edge research with building Aretian to help cities unlock their potential.',
    color: '#00C217',
    initials: 'RG',
  },
  {
    name: 'Gauthier de La Ville-Baugé',
    role: 'Director of Operations',
    bio: 'Leads project management and operations, ensuring seamless delivery of urban analytics solutions.',
    color: '#3b82f6',
    initials: 'GV',
  },
  {
    name: 'Fanny Magini',
    role: 'Director of Business Development',
    bio: 'Drives strategic partnerships and business growth, connecting Aretian with cities and organizations worldwide.',
    color: '#8b5cf6',
    initials: 'FM',
  },
  {
    name: 'Fernando Yu',
    role: 'Economist',
    bio: 'Economic analysis and urban development strategy. Focuses on the intersection of spatial design and economic performance.',
    color: '#f59e0b',
    initials: 'FY',
  },
  {
    name: 'Céleste Richard',
    role: 'Project Manager',
    bio: 'Coordinates urban design initiatives and ensures projects deliver actionable insights for cities.',
    color: '#ec4899',
    initials: 'CR',
  },
  {
    name: 'Elijah Munn',
    role: 'Senior Product Developer',
    bio: 'Builds innovative digital tools and platforms that power Aretian\'s urban analytics solutions.',
    color: '#14b8a6',
    initials: 'EM',
  },
  {
    name: 'Pablo Rocabert',
    role: 'Urban Designer',
    bio: 'Creates spatial designs and visualizations that translate complex urban data into clear, actionable plans.',
    color: '#f97316',
    initials: 'PR',
  },
  {
    name: 'Nikhil Desai',
    role: 'Senior Data Scientist',
    bio: 'Develops advanced analytics and machine learning models to uncover patterns in urban systems.',
    color: '#6366f1',
    initials: 'ND',
  },
  {
    name: 'Bernat Salvanyà-Rovira',
    role: 'PhD & Researcher',
    bio: 'Conducts cutting-edge research in urban science and complexity, advancing the theoretical foundations of urban analytics.',
    color: '#ef4444',
    initials: 'BS',
  },
];

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
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: `${member.color}30` }}
              >
                {member.initials}
              </div>

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
          {/* Team list - takes full height minus partners */}
          <ListView members={TEAM} />
        </div>
      </Visible>

      {/* Partners banner - outside Visible for full width */}
      <div className="absolute bottom-0 left-0 right-0 h-56 flex flex-col justify-center w-full bg-[#0f0f1a]/80 backdrop-blur-md border-t border-white/5 z-10 overflow-hidden">
        <p className="text-white/50 text-sm md:text-base pt-4 mb-2 uppercase tracking-widest px-8 text-right">
          _Partners & Clients
        </p>
        <ScrollVelocity
          texts={[PARTNERS_ROW_1, PARTNERS_ROW_2]}
          velocity={30}
          className="partners-text"
          numCopies={4}
        />
        {/* Gradient overlay - fades from solid on left to transparent on right */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, #0f0f1a 0%, #0f0f1a 15%, rgba(15,15,26,0.8) 25%, rgba(15,15,26,0) 40%, transparent 100%)',
            zIndex: 50,
          }}
        />
        <style jsx global>{`
          .partners-text {
            color: rgba(255, 255, 255, 0.6);
            font-size: 1rem;
            font-weight: 500;
            letter-spacing: 0.02em;
          }
          @media (min-width: 768px) {
            .partners-text {
              font-size: 1.25rem;
            }
          }
        `}</style>
      </div>
    </section>
  );
}

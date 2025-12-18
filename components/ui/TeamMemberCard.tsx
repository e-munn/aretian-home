'use client';

import { motion } from 'framer-motion';
import { Linkedin, Mail } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  initials: string;
  image?: string;
  linkedin?: string;
  email?: string;
}

interface TeamMemberCardProps {
  member: TeamMember;
  index: number;
  accentColor?: string;
}

export function TeamMemberCard({ member, index, accentColor = '#00C217' }: TeamMemberCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative flex flex-col bg-[#12121a] rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all hover:shadow-2xl w-full"
    >
      {/* Photo Section - zoomed out to show more of the person */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-white/5 to-transparent">
        {member.image ? (
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            style={{ transform: 'scale(0.85)', transformOrigin: 'center 30%' }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-5xl font-bold text-white/20"
            style={{ fontFamily: 'var(--font-bebas-neue)' }}
          >
            {member.initials}
          </div>
        )}

        {/* Gradient overlay at bottom of image */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, #12121a 0%, transparent 100%)',
          }}
        />
      </div>

      {/* Info Section */}
      <div className="flex-[2] p-5 flex flex-col justify-between relative">
        {/* Accent line */}
        <div
          className="absolute top-0 left-5 right-5 h-px"
          style={{ backgroundColor: `${accentColor}30` }}
        />

        <div>
          {/* Name */}
          <h3
            className="text-white text-xl md:text-2xl uppercase tracking-wide leading-tight mb-1"
            style={{ fontFamily: 'var(--font-bebas-neue)' }}
          >
            {member.name}
          </h3>

          {/* Role */}
          <p
            className="text-sm font-medium uppercase tracking-wider mb-3"
            style={{ color: accentColor }}
          >
            {member.role}
          </p>

          {/* Bio - truncated */}
          <p
            className="text-xs leading-relaxed text-white/50"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {member.bio}
          </p>
        </div>

        {/* Social links */}
        <div className="flex items-center gap-2 mt-3">
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              style={{ color: accentColor }}
            >
              <Linkedin size={16} />
            </a>
          )}
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              style={{ color: accentColor }}
            >
              <Mail size={16} />
            </a>
          )}
        </div>
      </div>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{
          boxShadow: `inset 0 0 30px ${accentColor}10, 0 0 40px ${accentColor}05`,
        }}
      />
    </motion.div>
  );
}

export type { TeamMember };

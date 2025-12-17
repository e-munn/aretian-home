'use client';

import { LogoMarquee } from '@/components/ui/LogoMarquee';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  location?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Ramon Gras Alomà',
    role: 'Co-Founder & CEO',
    bio: 'City Science and Urban Design Researcher at Harvard University. Combines leading City Science research with building Aretian.',
    location: 'Barcelona / Boston',
  },
  {
    name: 'Jeremy Burke',
    role: 'Co-Founder',
    bio: 'Harvard Master in Design Engineering graduate. Uses data analytics and machine learning to give planners insights into how cities work.',
    location: 'Boston',
  },
  {
    name: 'Fernando Yu',
    role: 'Lead Economist',
    bio: 'Leadership team member focusing on economic analysis and urban development strategy.',
  },
  {
    name: 'Gauthier de La Ville de Baugé',
    role: 'Business Development & Operations',
    bio: 'Handles Project Management, Business Development, Communication and Marketing. IE University graduate with focus on International Relations and AI.',
  },
  {
    name: 'Céleste Richard',
    role: 'Senior Urban Designer',
    bio: 'Leads urban design initiatives and spatial analysis projects.',
  },
];

export function TeamSection() {
  return (
    <div className="w-full h-full bg-transparent flex items-center justify-center p-8 md:p-16">
      <div className="max-w-5xl w-full">
        <h2 className="text-3xl md:text-4xl font-medium text-white mb-2 font-google">Our Team</h2>
        <p className="text-white/50 mb-10 font-google">
          Harvard-based researchers and practitioners in urban science
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#424162] to-[#2a2a4a] mb-4 flex items-center justify-center text-white/70 text-lg font-medium">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-white font-medium text-lg font-google">{member.name}</h3>
              <p className="text-[#00C217] text-sm mb-2 font-google">{member.role}</p>
              {member.location && (
                <p className="text-white/30 text-xs mb-2 font-google">{member.location}</p>
              )}
              <p className="text-white/50 text-sm leading-relaxed font-google">{member.bio}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-white/30 text-sm font-google">
            Founded 2018 at Harvard School of Engineering and Applied Sciences
          </p>
        </div>

        <div className="mt-16">
          <h3 className="text-xl font-medium text-white mb-2 font-google">Partners & Clients</h3>
          <p className="text-white/40 text-sm mb-6 font-google">
            Organizations we've worked with
          </p>
          <LogoMarquee velocity={30} logoSize={60} rows={2} />
        </div>
      </div>
    </div>
  );
}

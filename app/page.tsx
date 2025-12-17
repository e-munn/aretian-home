'use client';

import { FullPageScroll } from '@/components/navigation/FullPageScroll';
import { NavSection } from '@/components/navigation/SideNav';
import {
  CitySection,
  TransitSection,
  ArchitectureSection,
  DesignSection,
  ProjectsSection,
  TeamSection,
  ContactSection,
} from '@/components/sections';

// Define sections for navigation
const sections: NavSection[] = [
  {
    id: 'city',
    label: 'Aretian',
  },
  {
    id: 'transit',
    label: 'Services',
    description: 'Boston transit network intensity map. Circle size represents daily trip frequency at each stop. Data from MBTA GTFS feeds.'
  },
  {
    id: 'architecture',
    label: 'Process',
    description: 'How we work: collecting urban data, analyzing patterns, and deploying actionable insights for city transformation.'
  },
  {
    id: 'design',
    label: 'Design',
    description: 'Design system and visual language. Consistent patterns for data visualization across urban contexts.'
  },
  {
    id: 'projects',
    label: 'Projects',
    description: 'Selected case studies and implementations. Urban planning tools deployed across multiple cities.'
  },
  {
    id: 'team',
    label: 'Team',
    description: 'Harvard-based researchers and practitioners in urban science, data analytics, and city planning.'
  },
  {
    id: 'contact',
    label: 'Contact',
    description: 'Get in touch to discuss urban analytics, city planning tools, or potential collaborations.'
  },
];

export default function Home() {
  return (
    <FullPageScroll sections={sections}>
      <CitySection />
      <TransitSection />
      <ArchitectureSection />
      <DesignSection />
      <ProjectsSection />
      <TeamSection />
      <ContactSection />
    </FullPageScroll>
  );
}

'use client';

import { FullPageScroll } from '@/components/navigation/FullPageScroll';
import { NavSection } from '@/components/navigation/SideNav';
import {
  CitySection,
  TransitSection,
  ArchitectureSection,
  DesignSection,
  ProjectsSection,
  ContactSection,
} from '@/components/sections';

// Define sections for navigation
const sections: NavSection[] = [
  { id: 'city', label: 'Barcelona' },
  { id: 'transit', label: 'Transit' },
  { id: 'architecture', label: 'Platform' },
  { id: 'design', label: 'Design' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

export default function Home() {
  return (
    <FullPageScroll sections={sections}>
      <CitySection />
      <TransitSection />
      <ArchitectureSection />
      <DesignSection />
      <ProjectsSection />
      <ContactSection />
    </FullPageScroll>
  );
}

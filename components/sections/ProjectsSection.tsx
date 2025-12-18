'use client';

import { motion } from 'framer-motion';
import { MessageCircleQuestion } from 'lucide-react';
import { Visible } from '@/components/layout/Visible';

// ProjectGlobe temporarily disabled due to three-globe compatibility issue
// const ProjectGlobe = dynamic(() => import('@/components/ui/ProjectGlobe').then(m => ({ default: m.ProjectGlobe })), {
//   ssr: false,
//   loading: () => (
//     <div className="w-full h-full flex items-center justify-center text-white/30">
//       <div className="flex items-center gap-2">
//         <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
//         <span className="text-sm">Loading globe...</span>
//       </div>
//     </div>
//   ),
// });

// Real Aretian projects with coordinates
const PROJECTS = [
  {
    name: 'Barcelona Metropolitan Digital Twin',
    description: 'State-of-the-art City Digital Twin simulating infrastructure, socio-economic dynamics, mobility, and land use across 36 municipalities.',
    tags: ['Digital Twin', 'City Science'],
    color: '#00C217',
    lat: 41.3851,
    lng: 2.1734,
    city: 'Barcelona, Spain',
  },
  {
    name: 'Sant Feliu Innovation District',
    description: 'Strategic masterplan transforming Sant Feliu de Llobregat into an innovation district through urban regeneration and institutional collaboration.',
    tags: ['Master Planning', 'Innovation'],
    color: '#3b82f6',
    lat: 41.3833,
    lng: 2.0448,
    city: 'Sant Feliu de Llobregat, Spain',
  },
  {
    name: 'NOA Belém Airport District',
    description: 'Masterplanning to revitalize Belém\'s airport area into an innovation hub supporting economic growth, sustainability, and COP30.',
    tags: ['Master Planning', 'Sustainability'],
    color: '#14b8a6',
    lat: -1.4558,
    lng: -48.4902,
    city: 'Belém, Brazil',
  },
  {
    name: 'Esplugues Innovation District',
    description: 'Transforming Esplugues into a leading innovation hub through strategic urban and economic regeneration.',
    tags: ['Innovation', 'Economic Dev'],
    color: '#8b5cf6',
    lat: 41.3764,
    lng: 2.0889,
    city: 'Esplugues de Llobregat, Spain',
  },
  {
    name: 'São Paulo CITI Innovation District',
    description: 'Analyzing the network of talent and urban infrastructure and developing an innovation placemaking strategy.',
    tags: ['Urban Analytics', 'Innovation'],
    color: '#f59e0b',
    lat: -23.5505,
    lng: -46.6333,
    city: 'São Paulo, Brazil',
  },
  {
    name: 'Global Cities Study',
    description: 'Revolutionizing urban planning with evidence-based city science across Amsterdam, Boston, Barcelona, Munich, and Stockholm.',
    tags: ['Research', 'City Science'],
    color: '#ec4899',
    lat: 52.3676,
    lng: 4.9041,
    city: 'Amsterdam, Netherlands',
  },
  {
    name: 'NYC Real Estate Predictive Modelling',
    description: 'Informing real estate strategy with advanced analytics for targeted investments in the U.S. market.',
    tags: ['Analytics', 'Real Estate'],
    color: '#6366f1',
    lat: 40.7128,
    lng: -74.006,
    city: 'New York City, USA',
  },
  {
    name: 'Badalona Innovation District',
    description: 'Growing job opportunities and strategic industry investment through innovation district masterplanning.',
    tags: ['Master Planning', 'Economic Dev'],
    color: '#0ea5e9',
    lat: 41.4469,
    lng: 2.2450,
    city: 'Badalona, Spain',
  },
  {
    name: 'Massport Digital Transformation',
    description: 'Enhancing MassPort\'s operational efficiency with a unified Airport Business Intelligence platform.',
    tags: ['Digital Twin', 'Software'],
    color: '#f97316',
    lat: 42.3656,
    lng: -71.0096,
    city: 'Boston, USA',
  },
  {
    name: 'EU Real Estate Investment',
    description: 'Targeting high-value industries and predicting office space demand for real estate development across Europe.',
    tags: ['Analytics', 'Real Estate'],
    color: '#84cc16',
    lat: 50.8503,
    lng: 4.3517,
    city: 'Brussels, Belgium',
  },
  {
    name: 'MIT Coworking Space Analytics',
    description: 'Sensor-based mapping to measure the success of start-up teams working in MIT\'s coworking space.',
    tags: ['Research', 'Analytics'],
    color: '#a855f7',
    lat: 42.3601,
    lng: -71.0942,
    city: 'Cambridge, USA',
  },
  {
    name: 'Mexico City & Monterrey Districts',
    description: 'Revitalizing Mexico City and Monterrey with cutting-edge analytics for innovation district growth.',
    tags: ['Master Planning', 'Innovation'],
    color: '#ef4444',
    lat: 19.4326,
    lng: -99.1332,
    city: 'Mexico City, Mexico',
  },
];

// Grid View
function GridView({ projects }: { projects: typeof PROJECTS }) {
  return (
    <div className="h-full p-6 md:p-8">
      <div
        className="h-full grid gap-3"
        style={{
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
        }}
      >
        {projects.map((project, i) => (
          <motion.button
            key={project.name}
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group relative rounded-xl p-4 flex flex-col text-left transition-all hover:scale-[1.02] overflow-hidden"
            style={{
              backgroundColor: `${project.color}10`,
              border: `1px solid ${project.color}25`,
              cursor: 'pointer',
            }}
            data-cursor-corners
          >
            {/* Tags at top */}
            <div className="flex flex-wrap gap-2 mb-3">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full"
                  style={{
                    color: project.color,
                    background: `${project.color}20`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h3
              className="text-base md:text-lg leading-tight mb-2 uppercase tracking-wide"
              style={{
                color: 'rgba(255,255,255,0.9)',
                fontFamily: 'var(--font-bebas-neue)',
              }}
            >
              {project.name}
            </h3>

            {/* Description - hidden on small, visible on hover */}
            <p className="text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white/50">
              {project.description}
            </p>

            {/* Hover icon */}
            <MessageCircleQuestion
              className="absolute bottom-3 right-3 w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0 transition-all duration-300"
              style={{ color: project.color }}
            />

            {/* Accent line at bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5 opacity-50"
              style={{ background: `linear-gradient(90deg, ${project.color}, transparent)` }}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Globe View - temporarily disabled
// function GlobeView({ projects }: { projects: typeof PROJECTS }) {
//   return (
//     <div className="h-full w-full">
//       <ProjectGlobe projects={projects} />
//     </div>
//   );
// }

export function ProjectsSection() {
  return (
    <section
      id="work"
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Visible>
        <GridView projects={PROJECTS} />
      </Visible>
    </section>
  );
}

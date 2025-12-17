'use client';

import dynamic from 'next/dynamic';

const CardSwap = dynamic(() => import('@/components/ui/CardSwap'), { ssr: false });
const Card = dynamic(() => import('@/components/ui/CardSwap').then(mod => ({ default: mod.Card })), { ssr: false });

// Real Aretian projects from https://www.aretian.com/projects
const PROJECTS = [
  {
    name: 'Barcelona Metropolitan Digital Twin',
    description: 'State-of-the-art City Digital Twin revolutionizing urban optimization. Simulates infrastructure, socio-economic dynamics, mobility, and land use across 36 municipalities with NVIDIA and Lenovo collaboration.',
    tags: ['Digital Twin', 'City Science'],
    image: '/projects/barcelona-digital-twin.jpg',
    link: 'https://www.aretian.com/visionforbarcelona',
  },
  {
    name: 'Global Cities Study',
    description: 'In-depth research with IESE Business School analyzing Amsterdam, Boston, Barcelona, Munich, and Stockholm. Reveals urban design can boost economic output by over 80% and increase property value.',
    tags: ['Urban Analytics', 'Research'],
    image: '/projects/global-cities.jpg',
    link: 'https://www.aretian.com/projects-1/global-cities-study:-amsterdam,-boston,-barcelona,-munich,-stockholm',
  },
  {
    name: 'Spanish Innovation Districts',
    description: 'Knowledge economy analysis for Madrid, Barcelona, and Bilbao. Strategic framework to foster 4-5 innovation districts where universities and industries coexist through institutional links.',
    tags: ['Innovation', 'Economic Dev'],
    image: '/projects/spanish-cities.jpg',
    link: 'https://www.aretian.com/our-work',
  },
  {
    name: 'Massachusetts Port Authority',
    description: 'Urban analytics consulting for strategic port development and regional economic integration with the Greater Boston metropolitan area.',
    tags: ['Consulting', 'Master Planning'],
    image: '/projects/massport.jpg',
    link: 'https://www.aretian.com/our-work',
  },
];

export function ProjectsSection() {
  return (
    <section
      id="projects"
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: '10%',
      }}
    >
      <div style={{ height: '500px', width: '550px', position: 'relative' }}>
        <CardSwap
          cardDistance={40}
          verticalDistance={50}
          delay={5000}
          pauseOnHover={true}
        >
          {PROJECTS.map((project, index) => {
            const colors = ['0, 194, 23', '59, 130, 246', '139, 92, 246', '245, 158, 11'];
            const glowColor = colors[index % colors.length];
            return (
              <Card key={project.name} glowColor={glowColor}>
                <div className="flex flex-col h-full justify-between">
                  {/* Header with label */}
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Content - title and description */}
                  <div className="mt-auto">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight tracking-tight">
                      {project.name}
                    </h3>
                    <p className="text-white/50 leading-relaxed text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {project.description}
                    </p>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#00C217] hover:text-[#00e01b] transition-colors opacity-0 group-hover:opacity-100 duration-300"
                    >
                      View case study
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </Card>
            );
          })}
        </CardSwap>
      </div>
    </section>
  );
}

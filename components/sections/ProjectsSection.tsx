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
          {PROJECTS.map((project) => (
            <Card key={project.name}>
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium text-white/50 bg-white/10 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{project.name}</h3>
                  <p className="text-white/60 leading-relaxed text-sm">{project.description}</p>
                </div>
                <div className="mt-6">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#00C217] hover:text-[#00e01b] transition-colors"
                  >
                    View case study →
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </CardSwap>
      </div>
    </section>
  );
}

'use client';

import dynamic from 'next/dynamic';

const CardSwap = dynamic(() => import('@/components/ui/CardSwap'), { ssr: false });
const Card = dynamic(() => import('@/components/ui/CardSwap').then(mod => ({ default: mod.Card })), { ssr: false });

const PROJECTS = [
  {
    name: 'Barcelona Housing',
    description: 'Comprehensive affordable housing analysis using urban analytics to identify optimal locations and policy interventions.',
    tags: ['Urban Analytics', 'Housing'],
  },
  {
    name: 'Smart Mobility',
    description: 'Transportation network optimization through machine learning and real-time data integration.',
    tags: ['Network Analysis', 'Digital Twin'],
  },
  {
    name: 'Urban Renewal',
    description: 'City center revitalization master plan combining economic development with sustainable design.',
    tags: ['Master Planning', 'Economic Dev'],
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
        background: '#0f0f1a',
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
          delay={4000}
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
                  <p className="text-white/60 leading-relaxed">{project.description}</p>
                </div>
                <div className="mt-6">
                  <span className="text-sm text-[#3b82f6] hover:text-[#60a5fa] cursor-pointer">
                    View case study →
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </CardSwap>
      </div>
    </section>
  );
}

'use client';

export function ProjectsSection() {
  const projects = [
    { name: 'Barcelona Housing', description: 'Affordable housing analysis' },
    { name: 'Smart Mobility', description: 'Transportation optimization' },
    { name: 'Urban Renewal', description: 'City center revitalization' },
  ];

  return (
    <div className="w-full h-full bg-[#020035] flex items-center justify-center p-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        {projects.map((project) => (
          <div
            key={project.name}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 mb-4 rounded-lg bg-[#00C217]/20 flex items-center justify-center">
              <div className="w-6 h-6 rounded bg-[#00C217]" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">{project.name}</h3>
            <p className="text-white/50">{project.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

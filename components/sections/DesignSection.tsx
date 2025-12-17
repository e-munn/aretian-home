'use client';

export function DesignSection() {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center p-16">
      <div className="max-w-4xl text-center">
        <div className="w-24 h-24 mx-auto mb-8 border-2 border-white/30 rounded-full flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-white/60 rounded-lg" />
        </div>
        <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
          Urban Design Solutions
        </h2>
        <p className="text-xl md:text-2xl font-light text-white/50">
          Creating sustainable, livable spaces through innovative urban design and master planning.
        </p>
      </div>
    </div>
  );
}

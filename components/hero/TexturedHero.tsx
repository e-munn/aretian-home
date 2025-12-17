'use client'
import { motion } from 'framer-motion'

/**
 * Textured Hero - Alternative version with layered text effect
 * Matches the polymorphous aesthetic from the reference image
 * Uses CSS gradients and layering instead of canvas animation
 */
export function TexturedHero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Multi-layered textured background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-800" />

        {/* Color noise overlays */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-purple-500/20" />
        </div>
        <div className="absolute inset-0 opacity-20 mix-blend-color-dodge">
          <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/20 via-transparent to-green-500/20" />
        </div>
        <div className="absolute inset-0 opacity-15 mix-blend-screen">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-purple-500/10" />
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/60" />
      </div>

      {/* Main content */}
      <div className="relative h-full flex items-center justify-center px-6">
        <div className="max-w-7xl w-full text-center">
          {/* Title with layered effect */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="relative"
          >
            {/* Background text layer (ghosted) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 blur-sm">
              <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl tracking-tight text-white leading-tight">
                A boutique practice
              </h1>
              <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight text-white leading-tight mt-4">
                designing tools for the
              </h2>
              <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight text-white leading-tight">
                future of architecture
              </h2>
            </div>

            {/* Foreground text layer */}
            <div className="relative flex flex-col items-center justify-center space-y-6">
              <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl tracking-tight text-white/95 leading-tight">
                A{' '}
                <span className="relative inline-block">
                  <span className="text-purple-400">boutique</span>
                  <span className="absolute inset-0 blur-md text-purple-400/50">boutique</span>
                </span>{' '}
                practice
              </h1>
              <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight text-white/90 leading-tight">
                designing{' '}
                <span className="relative inline-block">
                  <span className="text-blue-400">tools</span>
                  <span className="absolute inset-0 blur-md text-blue-400/50">tools</span>
                </span>{' '}
                for the{' '}
                <span className="relative inline-block">
                  <span className="text-green-400">future</span>
                  <span className="absolute inset-0 blur-md text-green-400/50">future</span>
                </span>{' '}
                of{' '}
                <span className="relative inline-block">
                  <span className="text-orange-400">architecture</span>
                  <span className="absolute inset-0 blur-md text-orange-400/50">architecture</span>
                </span>
              </h2>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  )
}

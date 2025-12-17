# Abstract Hero Component - Polymorphous Style

The new abstract hero component provides a visually striking, polymorphous aesthetic for the Aretian homepage.

## What's Changed

### Old Hero
- Simple rotating map background (Curtain component)
- Basic text overlay

### New Abstract Hero
- Animated particle network background
- Multi-colored particles (amber, purple, blue, red, green, orange)
- Connected particles creating a polymorphous, organic effect
- Layered typography with color accents
- Smooth fade-in animations

## Component Location

`/components/hero/AbstractHero.tsx`

## Features

### Visual Elements
1. **Animated Canvas Background**
   - 120 particles moving across the screen
   - Particles connect when within 120px distance
   - Color palette: amber, purple, blue, red, green, orange
   - Screen blend mode for ethereal effect

2. **Typography**
   - Large serif font (text-8xl on desktop)
   - Color-coded keywords:
     - "AI" in amber-400
     - "data" in purple-400
     - "tools" in blue-400
     - "future" in green-400
     - "architecture" in orange-400

3. **Animations**
   - Fade-in sequence for text (staggered delays)
   - Scroll indicator with bounce animation
   - Particles continuously animate

4. **Interactive Elements**
   - Two CTA buttons (Explore Projects, Learn More)
   - Hover effects on buttons
   - Scroll indicator

## Customization Options

### Change the Tagline

Edit lines 129-149 in `/components/hero/AbstractHero.tsx`:

```tsx
<h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight text-white/95 leading-tight">
  A polymorphous <span className="text-amber-400">AI</span> &{' '}
  <span className="text-purple-400">data</span>
</h1>
<h2 className="font-serif text-4xl md:text-6xl lg:text-7xl tracking-tight text-white/90 leading-tight">
  peripheral practice
</h2>
```

### Adjust Particle Count

Line 45:
```tsx
for (let i = 0; i < 120; i++) {  // Change this number
```

- More particles (200+): Denser, more chaotic
- Fewer particles (50-80): Minimal, cleaner

### Change Color Palette

Lines 35-42:
```tsx
const colors = [
  'rgba(234, 179, 8, 0.5)',   // amber/gold
  'rgba(147, 51, 234, 0.4)',  // purple
  'rgba(59, 130, 246, 0.4)',  // blue
  'rgba(239, 68, 68, 0.3)',   // red
  'rgba(34, 197, 94, 0.4)',   // green
  'rgba(251, 146, 60, 0.4)',  // orange
]
```

### Adjust Animation Speed

Lines 49-50:
```tsx
vx: (Math.random() - 0.5) * 0.3,  // Horizontal speed
vy: (Math.random() - 0.5) * 0.3,  // Vertical speed
```

- Higher values (0.5+): Faster movement
- Lower values (0.1-0.2): Slower, more calm

### Change Connection Distance

Line 86:
```tsx
if (distance < 120) {  // Connection threshold in pixels
```

- Larger (150+): More connections, denser web
- Smaller (80-100): Fewer connections, cleaner look

## Performance Tips

The particle animation uses `requestAnimationFrame` and is optimized for 60fps. If you experience performance issues:

1. **Reduce particle count** (line 45)
2. **Increase fade rate** (line 60): Change `0.08` to `0.12`
3. **Disable connections**: Comment out lines 81-94

## Alternative Versions

### Version 1: Current (Particle Network)
- Abstract, connected particles
- Polymorphous aesthetic
- Best for: Tech/innovation focus

### Version 2: Use Background Image Instead

Replace the canvas with a textured image:

```tsx
<div
  className="absolute inset-0 w-full h-full bg-cover bg-center"
  style={{
    backgroundImage: 'url(/path-to-image.jpg)',
    filter: 'brightness(0.6) contrast(1.2)'
  }}
/>
```

### Version 3: Hybrid Approach

Keep particles but add a subtle background image:

```tsx
{/* Add before canvas */}
<div
  className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30"
  style={{ backgroundImage: 'url(/texture.jpg)' }}
/>
```

## Integration

The component is already integrated in `/app/page.tsx`:

```tsx
import { AbstractHero } from '@/components/hero/AbstractHero'

export default function Index() {
  return (
    <>
      <AbstractHero />
      {/* Rest of page */}
    </>
  )
}
```

## Typography Matching Your Image

To match the exact style from your reference image more closely:

```tsx
<h1 className="font-serif text-6xl md:text-8xl lg:text-9xl tracking-tighter text-white/90 leading-none">
  A polymorphous AI & data
</h1>
<h2 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tighter text-white/85 leading-none mt-4">
  peripheral practice
</h2>
<p className="font-mono text-xl md:text-2xl text-white/70 mt-8">
  designing tools for the
</p>
<p className="font-mono text-xl md:text-2xl text-white/70">
  future of architecture
</p>
```

## Next Steps

1. ✅ Component created and integrated
2. ✅ Particle animation working
3. ✅ Typography styled with color accents
4. Test on different screen sizes
5. Adjust colors to match brand
6. Add custom background image if desired
7. Fine-tune animation speeds

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile: Works well, may adjust particle count for performance

The component uses standard Canvas API and CSS, ensuring broad compatibility.

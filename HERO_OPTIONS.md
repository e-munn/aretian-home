# Hero Component Options

Both hero components now use the correct tagline:

```
A boutique practice
designing tools for the future of architecture
```

## Option 1: AbstractHero (Currently Active)

**File**: `/components/hero/AbstractHero.tsx`

**Visual Style**:
- Animated particle network background
- 120+ colorful particles (amber, purple, blue, red, green, orange)
- Particles connect when close, creating organic web
- Black background with screen blend mode
- Smooth fade-in animations

**Typography**:
```
A boutique practice
designing tools for the future of architecture
```

**Color Accents**:
- "boutique" → purple-400
- "tools" → blue-400
- "future" → green-400
- "architecture" → orange-400

**Pros**:
- Eye-catching, dynamic
- Matches "polymorphous" aesthetic
- Tech-forward feel
- Engaging motion

**Cons**:
- Uses Canvas API (more CPU)
- ~120 particles may be heavy on mobile
- Can't screenshot the animation

**Performance**: Good on desktop, reduce particles for mobile

---

## Option 2: TexturedHero (Alternative)

**File**: `/components/hero/TexturedHero.tsx`

**Visual Style**:
- Multi-layered gradient backgrounds
- Ghosted text effect (duplicate layer with blur)
- Glowing accents on keywords
- Pure CSS (no canvas)
- Sophisticated, editorial feel

**Typography**:
```
A boutique practice
designing tools for the future of architecture
```

**Special Effects**:
- Each colored word has a glowing blur shadow
- Background ghosted text layer for depth
- Vignette gradient overlay

**Pros**:
- Better performance (pure CSS)
- Consistent on all devices
- Elegant, refined aesthetic
- Screenshots well

**Cons**:
- Less dynamic than particle version
- No animation besides fade-in
- Simpler visual interest

**Performance**: Excellent, instant load

---

## Quick Comparison

| Feature | AbstractHero | TexturedHero |
|---------|-------------|--------------|
| Animation | ✅ Particle network | ❌ Static gradients |
| Performance | Good (desktop) | Excellent (all devices) |
| CPU Usage | Medium | Low |
| Mobile | Reduce particles | Perfect |
| Style | Tech/Dynamic | Elegant/Refined |
| Load Time | ~50ms (canvas init) | Instant |
| Best For | Interactive sites | Content-focused |

---

## How to Switch

### Currently Active: AbstractHero

Your `/app/page.tsx` imports:
```tsx
import { AbstractHero } from '@/components/hero/AbstractHero'
```

### To Use TexturedHero Instead:

1. Change the import:
```tsx
import { TexturedHero } from '@/components/hero/TexturedHero'
```

2. Replace the component:
```tsx
<TexturedHero />
```

That's it! Both components are drop-in replacements for each other.

---

## Customization Quick Reference

### AbstractHero - Particle Count
**File**: Line 45
```tsx
for (let i = 0; i < 120; i++) {  // Change this number
```
- Desktop: 120-150
- Mobile: 60-80
- Minimal: 30-50

### AbstractHero - Animation Speed
**File**: Lines 49-50
```tsx
vx: (Math.random() - 0.5) * 0.3,  // Increase for faster
vy: (Math.random() - 0.5) * 0.3,
```

### TexturedHero - Glow Intensity
**File**: Lines 60, 68, 73, 77 (adjust blur-md)
```tsx
<span className="absolute inset-0 blur-md text-purple-400/50">boutique</span>
                                        // ↑ Change to blur-lg for more glow
```

### Both - Color Accents

Change the keyword colors by editing the `text-*-400` classes:

```tsx
// Current colors
<span className="text-purple-400">boutique</span>   // Purple
<span className="text-blue-400">tools</span>        // Blue
<span className="text-green-400">future</span>      // Green
<span className="text-orange-400">architecture</span> // Orange

// Example: Make everything blue
<span className="text-blue-400">boutique</span>
<span className="text-blue-500">tools</span>
<span className="text-blue-600">future</span>
<span className="text-blue-700">architecture</span>
```

---

## Recommendations

**Use AbstractHero if**:
- You want maximum visual impact
- Target audience has modern devices
- Site is interactive/tech-focused
- Willing to optimize for mobile

**Use TexturedHero if**:
- Performance is critical
- Targeting mobile-first
- Want elegant, timeless aesthetic
- Prefer consistent experience across devices

**My Recommendation**:
Start with **TexturedHero** for best compatibility, then switch to **AbstractHero** if you want more dynamism and your analytics show primarily desktop users.

---

## Live Preview

To see both in action, create a test page:

```tsx
// /app/test-heroes/page.tsx
import { AbstractHero } from '@/components/hero/AbstractHero'
import { TexturedHero } from '@/components/hero/TexturedHero'

export default function TestPage() {
  return (
    <>
      <AbstractHero />
      <div className="h-screen" />
      <TexturedHero />
    </>
  )
}
```

Then visit `/test-heroes` to compare both side-by-side.

---

**Both components are production-ready and use the correct tagline!**

# Full Page Scroll - Usage Examples

## Basic Usage

```tsx
import {
  FullPageScroll,
  Section,
  NavigationDots,
  ScrollProgress,
  SectionIndicator,
  scrollVariants,
} from '@/components/scroll';

export default function HomePage() {
  return (
    <FullPageScroll
      duration={0.8}
      keyboard={true}
      touch={true}
      wheel={true}
      onSectionChange={(index) => console.log('Section:', index)}
    >
      <Section bg="#010029">
        <h1>Welcome</h1>
      </Section>

      <Section bg="#001529">
        <h1>Analytics</h1>
      </Section>

      <Section bg="#002039">
        <h1>Design</h1>
      </Section>

      <Section bg="#000020">
        <h1>Contact</h1>
      </Section>

      {/* Navigation UI */}
      <NavigationDots position="right" activeColor="#00C217" />
      <ScrollProgress position="top" />
      <SectionIndicator />
    </FullPageScroll>
  );
}
```

## With Different Transition Variants

```tsx
import { FullPageScroll, Section, scrollVariants } from '@/components/scroll';

// Available variants:
// - scrollVariants.slide (default - vertical slide)
// - scrollVariants.fade (fade in/out)
// - scrollVariants.scale (zoom in/out)
// - scrollVariants.horizontal (left/right slide)
// - scrollVariants.flip (3D flip)
// - scrollVariants.cube (3D cube rotation)

<FullPageScroll variants={scrollVariants.scale}>
  {/* sections */}
</FullPageScroll>
```

## Accessing Scroll State

```tsx
import { useFullPageScroll } from '@/components/scroll';

function MyComponent() {
  const {
    currentSection,
    totalSections,
    scrollTo,
    scrollNext,
    scrollPrev,
    isAnimating,
    direction,
  } = useFullPageScroll();

  return (
    <div>
      <p>Section {currentSection + 1} of {totalSections}</p>
      <button onClick={scrollPrev}>Previous</button>
      <button onClick={scrollNext}>Next</button>
      <button onClick={() => scrollTo(0)}>Go to first</button>
    </div>
  );
}
```

## Scroll Reveal Animations

```tsx
import { ScrollReveal, StaggerReveal, TextReveal } from '@/components/scroll';

// Single element reveal
<ScrollReveal animation="slideUp" delay={0.2}>
  <h1>Hello World</h1>
</ScrollReveal>

// Available animations: 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'blur'

// Staggered children
<StaggerReveal stagger={0.1} animation="slideUp">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</StaggerReveal>

// Character-by-character text reveal
<TextReveal text="Welcome to Aretian" stagger={0.03} />
```

## Parallax Effects

```tsx
import { useParallax } from '@/components/scroll';
import { motion } from 'framer-motion';

function ParallaxSection() {
  const { ref, y } = useParallax({ speed: 0.5 });

  return (
    <div ref={ref}>
      <motion.div style={{ y }}>
        <h1>Parallax Content</h1>
      </motion.div>
    </div>
  );
}
```

## Controls

- **Mouse wheel**: Scroll up/down
- **Arrow keys**: Up/Down to navigate
- **Page Up/Down**: Navigate sections
- **Home/End**: Jump to first/last section
- **Space**: Next section
- **Touch/Swipe**: Swipe up/down on mobile

## Custom Variants

```tsx
const myCustomVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    y: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? '-50%' : '50%',
    opacity: 0,
    scale: 1.1,
  }),
};

<FullPageScroll variants={myCustomVariants}>
  {/* sections */}
</FullPageScroll>
```

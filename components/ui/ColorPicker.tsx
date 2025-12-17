"use client"

import { usePointerPosition } from "motion-plus/react"
import {
    animate,
    motion,
    SpringOptions,
    useMotionValue,
    useSpring,
    useTransform,
} from "motion/react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

// Aretian-aligned color palette
const PALETTE_COLORS = [
  { color: '#3c324e', label: 'Purple Gray' },      // Current default
  { color: '#2a2a4a', label: 'Deep Indigo' },
  { color: '#1a3a5c', label: 'Ocean Blue' },
  { color: '#2d4a3a', label: 'Forest Green' },
  { color: '#4a3a2a', label: 'Warm Brown' },
  { color: '#4a2a3a', label: 'Muted Berry' },
]

const INNER_COLORS = [
  { color: '#5a4a6e', label: 'Light Purple' },
  { color: '#4a5a7e', label: 'Steel Blue' },
  { color: '#4a6a5a', label: 'Sage' },
  { color: '#6a5a4a', label: 'Taupe' },
  { color: '#5a3a4a', label: 'Plum' },
  { color: '#3a4a5a', label: 'Slate' },
]

const CENTER_COLOR = { color: '#ffffff', label: 'White' }

function calculateAngle(index: number, totalInRing: number): number {
    return (index / totalInRing) * Math.PI * 2 - Math.PI / 2
}

function calculateBasePosition(angle: number, radius: number) {
    return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
    }
}

interface ColorDotProps {
    ring: number
    index: number
    totalInRing: number
    centerX: number
    centerY: number
    pointerX: ReturnType<typeof usePointerPosition>["x"]
    pointerY: ReturnType<typeof usePointerPosition>["y"]
    pushMagnitude: number
    pushSpring: SpringOptions
    radius: number
    selectedColor: string | null
    onSelectColor: (color: string) => void
    color: string
}

function ColorDot({
    ring,
    index,
    totalInRing,
    centerX,
    centerY,
    pointerX,
    pointerY,
    pushMagnitude,
    pushSpring,
    radius,
    selectedColor,
    onSelectColor,
    color,
}: ColorDotProps) {
    const baseRadius = ring * 18
    const angle = calculateAngle(index, totalInRing)
    const { x: baseX, y: baseY } = calculateBasePosition(angle, baseRadius)

    const pushDistance = useTransform(() => {
        if (centerX === 0 || centerY === 0) return 0

        const px = pointerX.get()
        const py = pointerY.get()

        const dx = px - centerX
        const dy = py - centerY
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy)

        if (distanceFromCenter > radius) return 0

        const dotX = centerX + baseX
        const dotY = centerY + baseY

        const cursorToDotX = dotX - px
        const cursorToDotY = dotY - py
        const cursorToDotDistance = Math.sqrt(
            cursorToDotX * cursorToDotX + cursorToDotY * cursorToDotY
        )

        const minDistance = 60
        if (cursorToDotDistance < minDistance) {
            const pushStrength = 1 - cursorToDotDistance / minDistance
            return pushStrength * pushMagnitude
        }

        return 0
    })

    const pushAngle = useTransform(() => {
        if (centerX === 0 || centerY === 0) return angle

        const px = pointerX.get()
        const py = pointerY.get()

        const dotX = centerX + baseX
        const dotY = centerY + baseY

        const cursorToDotX = dotX - px
        const cursorToDotY = dotY - py

        return Math.atan2(cursorToDotY, cursorToDotX)
    })

    const pushX = useTransform(() => {
        const distance = pushDistance.get()
        const angle = pushAngle.get()
        return Math.cos(angle) * distance
    })

    const pushY = useTransform(() => {
        const distance = pushDistance.get()
        const angle = pushAngle.get()
        return Math.sin(angle) * distance
    })

    const springPushX = useSpring(pushX, pushSpring)
    const springPushY = useSpring(pushY, pushSpring)

    const x = useTransform(() => baseX + springPushX.get())
    const y = useTransform(() => baseY + springPushY.get())

    const isSelected = selectedColor === color

    return (
        <motion.div
            className="color-picker-dot"
            style={{
                x,
                y,
                backgroundColor: color,
                willChange: "transform",
                boxShadow: isSelected ? `0 0 0 2px white, 0 0 12px ${color}` : 'none',
            }}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.4 }}
            whileTap={{ scale: 1.2 }}
            onTap={() => onSelectColor(color)}
            transition={{
                scale: { type: "spring", damping: 30, stiffness: 200 },
            }}
        />
    )
}

interface GradientCircleProps {
    index: number
    totalInRing: number
    centerX: number
    centerY: number
    pointerX: ReturnType<typeof usePointerPosition>["x"]
    pointerY: ReturnType<typeof usePointerPosition>["y"]
    containerRadius: number
    color: string
}

function GradientCircle({
    index,
    totalInRing,
    centerX,
    centerY,
    pointerX,
    pointerY,
    containerRadius,
    color,
}: GradientCircleProps) {
    const angle = calculateAngle(index, totalInRing)
    const baseRadius = containerRadius - 30
    const { x: baseX, y: baseY } = calculateBasePosition(angle, baseRadius)

    const gradient = `radial-gradient(circle, ${color}cc 0%, ${color}00 66%)`

    const proximity = useTransform(() => {
        if (centerX === 0 || centerY === 0) return 0

        const px = pointerX.get()
        const py = pointerY.get()

        const gradientX = centerX + baseX
        const gradientY = centerY + baseY

        const dx = px - gradientX
        const dy = py - gradientY
        const distance = Math.sqrt(dx * dx + dy * dy)

        const maxDistance = 80
        const proximityValue = Math.max(0, 1 - distance / maxDistance)

        return proximityValue
    })

    const opacity = useTransform(proximity, [0, 1], [0.2, 0.5])
    const scale = useTransform(proximity, [0, 1], [1, 1.2])

    const springOpacity = useSpring(opacity, { damping: 30, stiffness: 100 })
    const springScale = useSpring(scale, { damping: 30, stiffness: 100 })

    return (
        <motion.div
            className="color-picker-gradient"
            style={{
                x: baseX,
                y: baseY,
                opacity: springOpacity,
                scale: springScale,
                background: gradient,
                willChange: "transform, opacity",
            }}
        />
    )
}

interface ColorPickerProps {
    onColorChange?: (color: string) => void
    initialColor?: string
    pushMagnitude?: number
    pushSpring?: SpringOptions
}

export default function ColorPicker({
    onColorChange,
    initialColor = '#3c324e',
    pushMagnitude = 5,
    pushSpring = { damping: 30, stiffness: 100 },
}: ColorPickerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [{ centerX, centerY, radius }, setContainerDimensions] = useState({
        centerX: 0,
        centerY: 0,
        radius: 100,
    })

    const pointer = usePointerPosition()
    const [selectedColor, setSelectedColor] = useState<string>(initialColor)

    useLayoutEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect()
                setContainerDimensions({
                    centerX: rect.left + rect.width / 2,
                    centerY: rect.top + rect.height / 2,
                    radius: rect.width / 2,
                })
            }
        }
        updateDimensions()
        window.addEventListener('resize', updateDimensions)
        window.addEventListener('scroll', updateDimensions)
        return () => {
            window.removeEventListener('resize', updateDimensions)
            window.removeEventListener('scroll', updateDimensions)
        }
    }, [])

    const handleSelectColor = (color: string) => {
        setSelectedColor(color)
        onColorChange?.(color)
    }

    // Build dots array: center (1), inner ring (6), outer ring (6)
    const dots: Array<{ ring: number; index: number; totalInRing: number; color: string }> = []

    // Center dot
    dots.push({ ring: 0, index: 0, totalInRing: 1, color: CENTER_COLOR.color })

    // Inner ring
    INNER_COLORS.forEach((c, i) => {
        dots.push({ ring: 1, index: i, totalInRing: INNER_COLORS.length, color: c.color })
    })

    // Outer ring
    PALETTE_COLORS.forEach((c, i) => {
        dots.push({ ring: 2, index: i, totalInRing: PALETTE_COLORS.length, color: c.color })
    })

    const gradientScale = useMotionValue(1)

    useEffect(() => {
        animate(gradientScale, selectedColor !== initialColor ? 1.05 : 1, {
            type: "spring",
            visualDuration: 0.2,
            bounce: 0.3,
        })
    }, [selectedColor, gradientScale, initialColor])

    return (
        <div className="color-picker-wrapper">
            <div className="color-picker-bg">
                <motion.div
                    className="color-picker-ring"
                    style={{ scale: gradientScale }}
                    animate={{
                        background: `conic-gradient(from 0deg, ${PALETTE_COLORS.map(c => c.color).join(', ')}, ${PALETTE_COLORS[0].color})`
                    }}
                />
                <motion.div
                    className="color-picker-center"
                    animate={{ scale: selectedColor !== initialColor ? 0.92 : 0.96 }}
                    transition={{ type: "spring", visualDuration: 0.2, bounce: 0.2 }}
                />
            </div>
            <div ref={containerRef} className="color-picker-container">
                {PALETTE_COLORS.map((c, index) => (
                    <GradientCircle
                        key={`gradient-${index}`}
                        index={index}
                        totalInRing={PALETTE_COLORS.length}
                        centerX={centerX}
                        centerY={centerY}
                        pointerX={pointer.x}
                        pointerY={pointer.y}
                        containerRadius={radius}
                        color={c.color}
                    />
                ))}
                {dots.slice().reverse().map((dot) => (
                    <ColorDot
                        key={`${dot.ring}-${dot.index}`}
                        ring={dot.ring}
                        index={dot.index}
                        totalInRing={dot.totalInRing}
                        centerX={centerX}
                        centerY={centerY}
                        pointerX={pointer.x}
                        pointerY={pointer.y}
                        radius={radius}
                        pushMagnitude={pushMagnitude}
                        pushSpring={pushSpring}
                        selectedColor={selectedColor}
                        onSelectColor={handleSelectColor}
                        color={dot.color}
                    />
                ))}
            </div>
            <style>{`
                .color-picker-wrapper {
                    position: relative;
                    width: 100px;
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .color-picker-bg {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                }
                .color-picker-ring {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    z-index: 0;
                    opacity: 0.8;
                }
                .color-picker-center {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    background-color: #0f0f1a;
                    border-radius: 50%;
                    z-index: 1;
                }
                .color-picker-container {
                    position: relative;
                    width: calc(100% - 4px);
                    height: calc(100% - 4px);
                    border-radius: 50%;
                    overflow: visible;
                    z-index: 2;
                }
                .color-picker-dot {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    translate: -50% -50%;
                    cursor: pointer;
                    border: 1px solid rgba(255,255,255,0.15);
                }
                .color-picker-gradient {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    translate: -50% -50%;
                    pointer-events: none;
                    mix-blend-mode: soft-light;
                }
            `}</style>
        </div>
    )
}

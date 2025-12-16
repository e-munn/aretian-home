"use client";

import { Cursor, useCursorState } from "motion-plus/react";
import { animate, motion, useMotionValue } from "motion/react";
import { useEffect } from "react";
import { useCursorContext } from "./CursorProvider";

function Corner({
  thickness = 2,
  length = 10,
  color = "var(--foreground)",
  ...position
}: {
  thickness?: number;
  length?: number;
  color?: string;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}) {
  return (
    <>
      <motion.div
        layout
        className="absolute transition-colors duration-300"
        style={{
          width: thickness,
          height: length,
          backgroundColor: color,
          ...position,
        }}
      />
      <motion.div
        layout
        className="absolute transition-colors duration-300"
        style={{
          width: length,
          height: thickness,
          backgroundColor: color,
          ...position,
        }}
      />
    </>
  );
}

export default function CustomCursor() {
  const state = useCursorState();
  const rotate = useMotionValue(0);
  const { hideCursor, darkMode } = useCursorContext();

  const cursorColor = darkMode ? "#ffffff" : "var(--foreground)";

  useEffect(() => {
    if (!state.targetBoundingBox) {
      animate(rotate, [rotate.get(), rotate.get() + 360], {
        duration: 3,
        ease: "linear",
        repeat: Infinity,
      });
    } else {
      animate(rotate, Math.round(rotate.get() / 180) * 180, {
        type: "spring",
        bounce: 0.3,
      });
    }
  }, [state.targetBoundingBox, rotate]);

  if (hideCursor) return null;

  return (
    <>
      <Cursor
        magnetic={{ morph: false, snap: 0 }}
        style={{ width: 5, height: 5, backgroundColor: cursorColor, transition: "background-color 0.3s" }}
        className="pointer-events-none"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      <Cursor
        magnetic={{ snap: 0.9, morph: true }}
        style={{ rotate, width: 40, height: 40, backgroundColor: "transparent" }}
        variants={{
          pressed: { scale: state.targetBoundingBox ? 0.9 : 0.7 },
        }}
        className="pointer-events-none"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <>
          <Corner top={0} left={0} color={cursorColor} />
          <Corner top={0} right={0} color={cursorColor} />
          <Corner bottom={0} left={0} color={cursorColor} />
          <Corner bottom={0} right={0} color={cursorColor} />
        </>
      </Cursor>
    </>
  );
}

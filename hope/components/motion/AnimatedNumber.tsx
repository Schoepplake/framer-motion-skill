"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

export interface AnimatedNumberProps {
  value: number;
  /** Formatierungsfunktion für den gerundeten Wert. */
  format?: (v: number) => string;
  className?: string;
}

/** Animierter Zähler auf Basis von MotionValues (kein Re-render je Frame). */
export function AnimatedNumber({ value, format, className }: AnimatedNumberProps) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) =>
    format ? format(v) : Math.round(v).toString(),
  );

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.7, ease: "easeOut" });
    return controls.stop;
  }, [value, mv, reduce]);

  return <motion.span className={className}>{text}</motion.span>;
}

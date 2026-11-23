"use client";

import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const EASE_SMOOTH: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface MotionSectionProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export function MotionSection({
  children,
  delay = 0,
  className = "",
  ...props
}: MotionSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.45, delay, ease: EASE_SMOOTH }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface MotionCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  index?: number;
}

export function MotionCard({
  children,
  index = 0,
  className = "",
  ...props
}: MotionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.06, 0.3),
        ease: EASE_SMOOTH,
      }}
      whileHover={{ y: -4 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface MotionButtonProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

export function MotionButton({
  children,
  className = "",
  ...props
}: MotionButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.975 }}
      transition={{ duration: 0.16, ease: EASE_SMOOTH }}
      className={`inline-block ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface AutoListProps {
  children: ReactNode;
  className?: string;
}

export function AutoList({ children, className = "" }: AutoListProps) {
  const [parentRef] = useAutoAnimate<HTMLDivElement>({
    duration: 220,
    easing: "ease-out",
  });

  return (
    <div ref={parentRef} className={className}>
      {children}
    </div>
  );
}

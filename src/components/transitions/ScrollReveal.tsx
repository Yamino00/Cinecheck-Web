"use client";

import { motion, Variants } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?:
    | "fade"
    | "slideUp"
    | "slideDown"
    | "slideLeft"
    | "slideRight"
    | "zoom"
    | "blur";
  delay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
  stagger?: number; // For multiple children
}

const animationVariants: Record<string, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
  slideDown: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  zoom: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(10px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  },
};

export function ScrollReveal({
  children,
  className,
  animation = "slideUp",
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  triggerOnce = true,
  stagger = 0,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal({
    threshold,
    triggerOnce,
  });

  const variants = animationVariants[animation];

  return (
    <motion.div
      ref={ref as any}
      className={cn(className)}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// Stagger container for multiple children
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  animation?: ScrollRevealProps["animation"];
  threshold?: number;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  animation = "slideUp",
  threshold = 0.1,
}: StaggerContainerProps) {
  const { ref, isVisible } = useScrollReveal({
    threshold,
    triggerOnce: true,
  });

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants = animationVariants[animation];

  return (
    <motion.div
      ref={ref as any}
      className={cn(className)}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}

// Parallax scroll effect
interface ParallaxScrollProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // 0 to 1, where 0.5 is half speed
  direction?: "up" | "down";
}

export function ParallaxScroll({
  children,
  className,
  speed = 0.5,
  direction = "up",
}: ParallaxScrollProps) {
  const { ref, isVisible } = useScrollReveal({
    threshold: 0,
    triggerOnce: false,
  });

  const multiplier = direction === "up" ? -1 : 1;

  return (
    <motion.div
      ref={ref as any}
      className={cn(className)}
      style={{
        y: isVisible ? 0 : multiplier * 100 * speed,
      }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

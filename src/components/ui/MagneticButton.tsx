"use client";

import { motion } from "framer-motion";
import { useMagneticHover } from "@/hooks/useMagneticHover";
import { useRipple } from "@/hooks/useRipple";
import { cn } from "@/lib/utils";

interface MagneticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  withRipple?: boolean;
  withGlow?: boolean;
  magneticStrength?: number;
  children: React.ReactNode;
}

export function MagneticButton({
  variant = "primary",
  size = "md",
  withRipple = true,
  withGlow = false,
  magneticStrength = 0.3,
  className,
  onClick,
  children,
  disabled,
  type,
  ...props
}: MagneticButtonProps) {
  const { ref, style, isHovered } = useMagneticHover({
    strength: magneticStrength,
  });
  const { ripples, addRipple } = useRipple();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (withRipple) {
      addRipple(e);
    }
    onClick?.(e);
  };

  const variants = {
    primary:
      "bg-white text-netflix-dark-950 hover:bg-white/90 active:bg-white/80",
    secondary:
      "bg-netflix-dark-800/60 backdrop-blur-xl text-white border border-white/20 hover:border-white/40 hover:bg-netflix-dark-800/80",
    ghost:
      "bg-transparent text-white hover:bg-white/10 active:bg-white/20 border border-white/10 hover:border-white/30",
    danger:
      "bg-netflix-600 text-white hover:bg-netflix-700 active:bg-netflix-800",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const glowClass = withGlow && isHovered ? "shadow-netflix animate-glow" : "";

  return (
    <motion.button
      ref={ref as any}
      style={style}
      className={cn(
        "relative overflow-hidden font-semibold rounded-lg transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-netflix-600 focus:ring-offset-2 focus:ring-offset-netflix-dark-950",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        glowClass,
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      type={type}
      whileTap={disabled ? {} : { scale: 0.97 }}
    >
      {/* Content */}
      <span className="relative z-10">{children}</span>

      {/* Ripple effects */}
      {withRipple &&
        ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/30"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}

      {/* Hover overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "100%" : "-100%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
    </motion.button>
  );
}

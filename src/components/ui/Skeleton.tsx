"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular" | "rounded";
  width?: string | number;
  height?: string | number;
  animated?: boolean;
  delay?: number;
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  animated = true,
  delay = 0,
}: SkeletonProps) {
  const baseClasses =
    "bg-gradient-to-r from-netflix-dark-800 via-netflix-dark-700 to-netflix-dark-800 bg-[length:400%_100%]";

  const variantClasses = {
    text: "h-4 rounded",
    rectangular: "rounded-md",
    circular: "rounded-full aspect-square",
    rounded: "rounded-lg",
  };

  const animationClasses = animated
    ? "animate-[shimmer_2s_ease-in-out_infinite]"
    : "";

  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses,
        className
      )}
      style={style}
    />
  );
}

// Skeleton for movie cards
export function MovieCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Poster */}
      <Skeleton variant="rounded" className="aspect-[2/3] w-full" delay={0} />

      {/* Title */}
      <div className="space-y-2">
        <Skeleton variant="text" className="h-5 w-3/4" delay={0.1} />

        {/* Metadata */}
        <div className="flex justify-between items-center">
          <Skeleton variant="text" className="h-4 w-16" delay={0.2} />
          <Skeleton variant="text" className="h-4 w-12" delay={0.3} />
        </div>
      </div>
    </div>
  );
}

// Skeleton for movie grid
export function MovieGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton for profile page
export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-6">
        <Skeleton variant="circular" width={120} height={120} delay={0} />

        <div className="flex-1 space-y-4">
          <Skeleton variant="text" className="h-8 w-48" delay={0.1} />
          <Skeleton variant="text" className="h-5 w-32" delay={0.2} />
          <Skeleton variant="text" className="h-4 w-64" delay={0.3} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton
              variant="text"
              className="h-8 w-16 mx-auto"
              delay={0.4 + i * 0.1}
            />
            <Skeleton
              variant="text"
              className="h-4 w-20 mx-auto"
              delay={0.5 + i * 0.1}
            />
          </div>
        ))}
      </div>

      {/* Content sections */}
      <div className="space-y-6">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton
              variant="text"
              className="h-6 w-40"
              delay={0.8 + i * 0.2}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, j) => (
                <div key={j} className="flex space-x-3">
                  <Skeleton
                    variant="rounded"
                    width={60}
                    height={90}
                    delay={1 + i * 0.2 + j * 0.1}
                  />
                  <div className="flex-1 space-y-2">
                    <Skeleton
                      variant="text"
                      className="h-4 w-full"
                      delay={1.1 + i * 0.2 + j * 0.1}
                    />
                    <Skeleton
                      variant="text"
                      className="h-3 w-3/4"
                      delay={1.2 + i * 0.2 + j * 0.1}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for search results
export function SearchResultsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex space-x-4 p-4 bg-netflix-dark-800 rounded-lg"
        >
          <Skeleton variant="rounded" width={80} height={120} delay={i * 0.1} />

          <div className="flex-1 space-y-3">
            <Skeleton
              variant="text"
              className="h-6 w-3/4"
              delay={i * 0.1 + 0.1}
            />
            <Skeleton
              variant="text"
              className="h-4 w-1/2"
              delay={i * 0.1 + 0.2}
            />
            <Skeleton
              variant="text"
              className="h-4 w-full"
              delay={i * 0.1 + 0.3}
            />
            <Skeleton
              variant="text"
              className="h-4 w-2/3"
              delay={i * 0.1 + 0.4}
            />

            <div className="flex space-x-2 mt-4">
              {Array.from({ length: 3 }, (_, j) => (
                <Skeleton
                  key={j}
                  variant="rounded"
                  className="h-6 w-16"
                  delay={i * 0.1 + 0.5 + j * 0.05}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton for navigation
export function NavigationSkeleton() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-netflix-dark-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Skeleton variant="text" className="h-8 w-32" delay={0} />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton
                key={i}
                variant="text"
                className="h-5 w-16"
                delay={0.1 + i * 0.05}
              />
            ))}
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <Skeleton variant="text" className="h-8 w-20" delay={0.3} />
            <Skeleton variant="circular" width={32} height={32} delay={0.4} />
          </div>
        </div>
      </div>
    </nav>
  );
}

// Skeleton for quiz questions
export function QuizSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton variant="text" className="h-4 w-24" delay={0} />
          <Skeleton variant="text" className="h-4 w-16" delay={0.1} />
        </div>
        <Skeleton
          variant="rectangular"
          className="h-2 w-full rounded-full"
          delay={0.2}
        />
      </div>

      {/* Question */}
      <div className="space-y-4">
        <Skeleton variant="text" className="h-6 w-16" delay={0.3} />
        <Skeleton variant="text" className="h-8 w-full" delay={0.4} />
        <Skeleton variant="text" className="h-8 w-3/4" delay={0.5} />
      </div>

      {/* Answers */}
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            className="h-12 w-full"
            delay={0.6 + i * 0.1}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <Skeleton variant="rounded" className="h-10 w-24" delay={1} />
        <Skeleton variant="rounded" className="h-10 w-32" delay={1.1} />
      </div>
    </div>
  );
}

// Loading states wrapper
export function LoadingState({
  children,
  loading,
  skeleton,
  className,
}: {
  children: React.ReactNode;
  loading: boolean;
  skeleton: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{loading ? skeleton : children}</div>;
}

"use client";

import useEmblaCarousel from "embla-carousel-react";

interface InfiniteCarouselProps {
  title: string;
  children: React.ReactNode;
  onPrevious?: () => void;
  onNext?: () => void;
}

export default function InfiniteCarousel({
  title,
  children,
}: InfiniteCarouselProps) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    dragFree: true, // Scorrimento libero senza snap
    containScroll: false, // Permette scorrimento fluido oltre i bordi
  });

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-4 px-4 md:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Fade Gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-cinema-dark-950 to-transparent z-10 pointer-events-none" />

        {/* Right Fade Gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-cinema-dark-950 to-transparent z-10 pointer-events-none" />

        {/* Embla Viewport - Solo Drag */}
        <div
          className="overflow-hidden cursor-grab active:cursor-grabbing"
          ref={emblaRef}
        >
          <div className="flex gap-4 px-4 md:px-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

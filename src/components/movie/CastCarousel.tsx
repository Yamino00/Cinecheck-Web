"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { User, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path: string | null;
  job?: string;
}

interface CastCarouselProps {
  cast: CastMember[];
  title?: string;
}

export default function CastCarousel({
  cast,
  title = "Cast & Crew",
}: CastCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    skipSnaps: false,
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  // Update scroll buttons state
  const onSelect = () => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  };

  emblaApi?.on("select", onSelect);
  emblaApi?.on("reInit", onSelect);

  const getImageUrl = (profilePath: string | null) => {
    if (!profilePath) return null;
    return `https://image.tmdb.org/t/p/w185${profilePath}`;
  };

  return (
    <section id="cast" className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={`
              p-2 rounded-lg transition-all
              ${
                canScrollPrev
                  ? "bg-netflix-dark-800 hover:bg-netflix-dark-700 text-white"
                  : "bg-netflix-dark-900 text-gray-600 cursor-not-allowed"
              }
            `}
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={`
              p-2 rounded-lg transition-all
              ${
                canScrollNext
                  ? "bg-netflix-dark-800 hover:bg-netflix-dark-700 text-white"
                  : "bg-netflix-dark-900 text-gray-600 cursor-not-allowed"
              }
            `}
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {cast.map((member, index) => {
              const imageUrl = getImageUrl(member.profile_path);
              const isHovered = hoveredCard === member.id;

              return (
                <motion.div
                  key={member.id}
                  className="flex-[0_0_140px] md:flex-[0_0_160px] min-w-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredCard(member.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <motion.div
                    className="relative rounded-xl overflow-hidden bg-netflix-dark-800 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Profile Image */}
                    <div className="relative aspect-[2/3] bg-netflix-dark-800">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={member.name}
                          fill
                          className="object-cover"
                          sizes="160px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-netflix-dark-700">
                          <User className="w-12 h-12 text-gray-600" />
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>

                    {/* Info Overlay */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-center"
                        >
                          <p className="text-white font-semibold text-sm mb-1 line-clamp-2">
                            {member.name}
                          </p>
                          {member.character && (
                            <p className="text-gray-300 text-xs line-clamp-2">
                              {member.character}
                            </p>
                          )}
                          {member.job && (
                            <p className="text-netflix-600 text-xs font-medium mt-1">
                              {member.job}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Name Badge - Always Visible */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                      <p className="text-white text-sm font-medium line-clamp-1">
                        {member.name}
                      </p>
                      {member.character && (
                        <p className="text-gray-400 text-xs line-clamp-1">
                          {member.character}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Fade Gradients */}
        {canScrollPrev && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-netflix-dark-950 to-transparent pointer-events-none z-10" />
        )}
        {canScrollNext && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-netflix-dark-950 to-transparent pointer-events-none z-10" />
        )}
      </div>
    </section>
  );
}

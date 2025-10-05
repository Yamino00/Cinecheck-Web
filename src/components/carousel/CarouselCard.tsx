"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play, Plus, Info, Star } from "lucide-react";
import { PLACEHOLDER_POSTER_URL } from "@/components/placeholders";

export interface CarouselCardItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  media_type?: "movie" | "tv";
  release_date?: string;
  first_air_date?: string;
}

interface CarouselCardProps {
  item: CarouselCardItem;
  onPlayClick?: (id: number) => void;
  onAddClick?: (id: number) => void;
}

export default function CarouselCard({
  item,
  onPlayClick,
  onAddClick,
}: CarouselCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const title = item.title || item.name || "Untitled";
  const mediaType = item.media_type || "movie";
  const href = mediaType === "tv" ? `/series/${item.id}` : `/movie/${item.id}`;
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : PLACEHOLDER_POSTER_URL;

  const year = item.release_date
    ? new Date(item.release_date).getFullYear()
    : item.first_air_date
    ? new Date(item.first_air_date).getFullYear()
    : null;

  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  const handleCardClick = () => {
    router.push(href);
  };

  return (
    <motion.div
      className="flex-shrink-0 w-[140px] sm:w-[180px] md:w-[220px] lg:w-[240px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="relative rounded-lg overflow-hidden cursor-pointer"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        onClick={handleCardClick}
      >
        {/* Poster Image */}
        <div className="relative aspect-[2/3] bg-netflix-dark-800">
          <Image
            src={imageError ? PLACEHOLDER_POSTER_URL : posterUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 140px, (max-width: 768px) 180px, (max-width: 1024px) 220px, 240px"
            onError={() => setImageError(true)}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Rating Badge */}
          {rating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/80 backdrop-blur-sm"
            >
              <Star className="w-3 h-3 fill-accent-500 text-accent-500" />
              <span className="text-xs font-semibold text-white">{rating}</span>
            </motion.div>
          )}

          {/* Hover Overlay with Actions */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4"
                onClick={(e) => e.preventDefault()}
              >
                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <motion.button
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onPlayClick?.(item.id);
                    }}
                    className="w-10 h-10 rounded-full bg-white hover:bg-netflix-600 hover:text-white flex items-center justify-center transition-colors"
                    aria-label="Play"
                  >
                    <Play className="w-5 h-5 text-black fill-black" />
                  </motion.button>

                  <motion.button
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onAddClick?.(item.id);
                    }}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    aria-label="Add to watchlist"
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </motion.button>

                  <motion.button
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(href);
                    }}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    aria-label="More info"
                  >
                    <Info className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                {/* Title */}
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-sm font-semibold text-white text-center line-clamp-2"
                >
                  {title}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info Bar Below */}
        <div className="pt-2 space-y-1">
          <h3 className="text-sm font-medium text-white line-clamp-1">
            {title}
          </h3>
          {year && <p className="text-xs text-gray-400">{year}</p>}
        </div>
      </motion.div>
    </motion.div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Star, Play, Plus, Info, Clock, Calendar } from "lucide-react";
import { TMDBMovie } from "@/services/tmdb";
import { tmdb } from "@/services/tmdb";
import Link from "next/link";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { toast } from "@/components/ui/Toast";
import QuizOrReviewButton from "@/components/QuizOrReviewButton";

interface ParallaxHeroProps {
  movie: TMDBMovie;
}

export default function ParallaxHero({ movie }: ParallaxHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Parallax effects
  const backdropY = useTransform(scrollY, [0, 500], [0, 150]);
  const contentY = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : "";

  return (
    <div
      ref={containerRef}
      className="relative h-[100vh] md:h-[85vh] min-h-[600px] md:min-h-[700px] w-full overflow-hidden"
    >
      {/* Parallax Backdrop */}
      <motion.div
        style={{ y: isClient ? backdropY : 0 }}
        className="absolute inset-0 scale-110"
      >
        <Image
          src={tmdb.getBackdropUrl(movie.backdrop_path, "original")}
          alt={movie.title}
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Netflix-style Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark-950 via-netflix-dark-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-dark-950 via-netflix-dark-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-netflix-dark-950" />
      </motion.div>

      {/* Animated Content */}
      <motion.div
        style={{ y: isClient ? contentY : 0, opacity: isClient ? opacity : 1 }}
        className="relative h-full container mx-auto px-4 md:px-8 flex items-end pb-16 md:pb-24"
      >
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 w-full max-w-7xl">
          {/* Poster - Desktop Only */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block flex-shrink-0"
          >
            <div className="relative w-72 h-[430px] rounded-xl overflow-hidden shadow-2xl ring-2 ring-netflix-600/30">
              <Image
                src={tmdb.getPosterUrl(movie.poster_path, "w500")}
                alt={`${movie.title} poster`}
                fill
                className="object-cover"
              />
              {/* Rating Badge on Poster */}
              {movie.vote_average > 0 && (
                <div className="absolute top-4 right-4 bg-netflix-dark-950/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-netflix-600/30">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-netflix-600 text-netflix-600" />
                    <span className="text-white font-bold text-lg">
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 space-y-6"
          >
            {/* Badge - Trending */}
            {movie.popularity > 100 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-netflix-600/20 backdrop-blur-sm border border-netflix-600/30">
                <div className="w-2 h-2 bg-netflix-600 rounded-full animate-pulse" />
                <span className="text-netflix-600 text-sm font-semibold uppercase tracking-wide">
                  Trending Now
                </span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-3">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-2xl leading-tight">
                {movie.title}
              </h1>
              {movie.title !== movie.original_title && (
                <p className="text-xl md:text-2xl text-gray-300 font-light">
                  {movie.original_title}
                </p>
              )}
            </div>

            {/* Tagline */}
            {movie.tagline && (
              <p className="text-lg md:text-xl italic text-gray-300 font-light max-w-2xl">
                "{movie.tagline}"
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm md:text-base text-gray-300">
              {year && (
                <>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{year}</span>
                  </div>
                  <span className="text-gray-600">•</span>
                </>
              )}
              {runtime && (
                <>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{runtime}</span>
                  </div>
                  <span className="text-gray-600">•</span>
                </>
              )}
              <div className="flex flex-wrap gap-2">
                {movie.genres.slice(0, 3).map((genre, index) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors cursor-default"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-netflix-dark-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-netflix-600/20">
                  <Star className="w-6 h-6 fill-netflix-600 text-netflix-600" />
                  <span className="text-2xl md:text-3xl font-bold text-white">
                    {movie.vote_average.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  {movie.vote_count.toLocaleString()} votes
                </span>
              </div>
            </div>

            {/* Overview */}
            <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-3xl line-clamp-3">
              {movie.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {/* Quiz or Review Button */}
              <QuizOrReviewButton
                contentId={movie.id}
                contentType="movie"
                contentTitle={movie.title}
              />

              {/* Add to List */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toast.success("Added to your list!")}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-netflix-dark-800/80 hover:bg-netflix-dark-700 backdrop-blur-sm text-white rounded-lg font-semibold text-lg transition-colors border border-white/10"
              >
                <Plus className="w-6 h-6" />
                <span>My List</span>
              </motion.button>

              {/* More Info */}
              <MagneticButton
                variant="ghost"
                size="lg"
                magneticStrength={0.2}
                onClick={() => {
                  document
                    .getElementById("overview")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center justify-center gap-3"
              >
                <Info className="w-6 h-6" />
                <span className="hidden sm:inline">More Info</span>
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
        >
          <motion.div className="w-1 h-2 bg-white/50 rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
}

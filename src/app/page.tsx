"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { tmdb, type TMDBMovie } from "@/services/tmdb";
import { Play, Info, TrendingUp, Star, Clock } from "lucide-react";
import InfiniteCarousel from "@/components/carousel/InfiniteCarousel";
import CarouselCard, {
  type CarouselCardItem,
} from "@/components/carousel/CarouselCard";
import Image from "next/image";
import Link from "next/link";
import { PLACEHOLDER_BACKDROP_URL } from "@/components/placeholders";
import { ScrollReveal } from "@/components/transitions/ScrollReveal";

export default function HomePage() {
  const [featuredMovie, setFeaturedMovie] = useState<TMDBMovie | null>(null);
  const [popularMovies, setPopularMovies] = useState<CarouselCardItem[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<CarouselCardItem[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<CarouselCardItem[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<CarouselCardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const [popular, trending, topRated, trendingTV] = await Promise.all([
        tmdb.getPopularMovies(),
        tmdb.getTrending("movie", "week"),
        tmdb.getTopRatedMovies(),
        tmdb.getTrending("tv", "week"),
      ]);

      // Set featured movie (first trending)
      if (trending.results.length > 0) {
        setFeaturedMovie(trending.results[0]);
      }

      // Map to CarouselCardItem format
      setPopularMovies(
        popular.results.slice(0, 20).map((m) => ({
          ...m,
          media_type: "movie" as const,
        }))
      );
      setTrendingMovies(
        trending.results.slice(1, 21).map((m) => ({
          ...m,
          media_type: "movie" as const,
        }))
      );
      setTopRatedMovies(
        topRated.results.slice(0, 20).map((m) => ({
          ...m,
          media_type: "movie" as const,
        }))
      );
      setTrendingSeries(
        trendingTV.results.slice(0, 20).map((s) => ({
          ...s,
          media_type: "tv" as const,
        }))
      );
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayClick = (id: number) => {
    console.log("Play clicked:", id);
    // TODO: Implement play functionality
  };

  const handleAddClick = (id: number) => {
    console.log("Add to watchlist:", id);
    // TODO: Implement add to watchlist
  };

  return (
    <div className="min-h-screen bg-cinema-dark-950 overflow-x-hidden">
      {/* Hero Section - Featured Content */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        {featuredMovie && (
          <>
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={
                  featuredMovie.backdrop_path
                    ? `https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`
                    : PLACEHOLDER_BACKDROP_URL
                }
                alt={featuredMovie.title}
                fill
                className="object-cover"
                priority
              />
              {/* Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark-950 via-netflix-dark-950/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-netflix-dark-950 via-transparent to-netflix-dark-950/80" />
            </div>

            {/* Content */}
            <div className="relative container mx-auto px-4 md:px-8 h-full flex flex-col justify-end pb-16 md:pb-24">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-2xl space-y-4 md:space-y-6"
              >
                {/* Badge */}
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-netflix-600/20 backdrop-blur-sm border border-netflix-600/30 text-netflix-600 text-xs font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    #1 Trending
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-2xl">
                  {featuredMovie.title}
                </h1>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  {featuredMovie.release_date && (
                    <span>
                      {new Date(featuredMovie.release_date).getFullYear()}
                    </span>
                  )}
                  {featuredMovie.vote_average && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-cinema-amber-500 text-cinema-amber-500" />
                      <span className="font-semibold">
                        {featuredMovie.vote_average.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {featuredMovie.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{featuredMovie.runtime} min</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-base md:text-lg text-gray-300 line-clamp-3 max-w-xl">
                  {featuredMovie.overview}
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href={`/movie/${featuredMovie.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-gray-200 text-black rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Play className="w-5 h-5 fill-black" />
                      Watch Now
                    </motion.button>
                  </Link>
                  <Link href={`/movie/${featuredMovie.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Info className="w-5 h-5" />
                      More Info
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </section>

      {/* Content Carousels */}
      <div className="space-y-12 py-12">
        {/* Trending Movies */}
        {trendingMovies.length > 0 && (
          <ScrollReveal animation="slideUp" delay={0.1}>
            <InfiniteCarousel title="🔥 Trending Movies">
              {trendingMovies.map((movie) => (
                <CarouselCard
                  key={movie.id}
                  item={movie}
                  onPlayClick={handlePlayClick}
                  onAddClick={handleAddClick}
                />
              ))}
            </InfiniteCarousel>
          </ScrollReveal>
        )}

        {/* Popular on Cinecheck */}
        {popularMovies.length > 0 && (
          <ScrollReveal animation="slideUp" delay={0.2}>
            <InfiniteCarousel title="⭐ Popular on Cinecheck">
              {popularMovies.map((movie) => (
                <CarouselCard
                  key={movie.id}
                  item={movie}
                  onPlayClick={handlePlayClick}
                  onAddClick={handleAddClick}
                />
              ))}
            </InfiniteCarousel>
          </ScrollReveal>
        )}

        {/* Trending Series */}
        {trendingSeries.length > 0 && (
          <ScrollReveal animation="slideUp" delay={0.1}>
            <InfiniteCarousel title="📺 Trending Series">
              {trendingSeries.map((series) => (
                <CarouselCard
                  key={series.id}
                  item={series}
                  onPlayClick={handlePlayClick}
                  onAddClick={handleAddClick}
                />
              ))}
            </InfiniteCarousel>
          </ScrollReveal>
        )}

        {/* Top Rated */}
        {topRatedMovies.length > 0 && (
          <ScrollReveal animation="slideUp" delay={0.2}>
            <InfiniteCarousel title="🏆 Top Rated Films">
              {topRatedMovies.map((movie) => (
                <CarouselCard
                  key={movie.id}
                  item={movie}
                  onPlayClick={handlePlayClick}
                  onAddClick={handleAddClick}
                />
              ))}
            </InfiniteCarousel>
          </ScrollReveal>
        )}
      </div>

      {/* Bottom spacing */}
      <div className="h-16" />
    </div>
  );
}

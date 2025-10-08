import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { tmdb } from "@/services/tmdb";
import ParallaxHero from "@/components/movie/ParallaxHero";
import AnimatedTabs from "@/components/ui/AnimatedTabs";
import MovieInfo from "./components/MovieInfo";
import MovieMedia from "./components/MovieMedia";
import MovieReviews from "./components/MovieReviews";
import MovieRecommendations from "./components/MovieRecommendations";
import { ScrollReveal } from "@/components/transitions/ScrollReveal";

interface MoviePageProps {
  params: {
    id: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  try {
    const movieId = parseInt(params.id);
    if (isNaN(movieId)) return { title: "Film non trovato" };

    const movie = await tmdb.getMovieComplete(movieId);

    return {
      title: `${movie.title} (${new Date(
        movie.release_date
      ).getFullYear()}) - Cinecheck`,
      description: movie.overview || `Guarda ${movie.title} su Cinecheck`,
      openGraph: {
        title: movie.title,
        description: movie.overview,
        images: [
          {
            url: tmdb.getBackdropUrl(movie.backdrop_path, "original"),
            width: 1920,
            height: 1080,
            alt: movie.title,
          },
        ],
        type: "video.movie",
      },
      twitter: {
        card: "summary_large_image",
        title: movie.title,
        description: movie.overview,
        images: [tmdb.getBackdropUrl(movie.backdrop_path, "original")],
      },
    };
  } catch (error) {
    return { title: "Film non trovato" };
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const movieId = parseInt(params.id);

  if (isNaN(movieId)) {
    notFound();
  }

  try {
    const movie = await tmdb.getMovieComplete(movieId);

    return (
      <div className="min-h-screen bg-netflix-dark-950">
        {/* Parallax Hero Section */}
        <ParallaxHero movie={movie} />

        {/* Main Content */}
        <div className="container mx-auto px-4 md:px-8 py-12 space-y-16">
          {/* Overview Section */}
          <ScrollReveal animation="slideUp" delay={0.1}>
            <section id="overview">
              <MovieInfo movie={movie} />
            </section>
          </ScrollReveal>

    
          {/* Reviews Section */}
          <ScrollReveal animation="slideUp" delay={0.1}>
            <section id="reviews">
              <Suspense
                fallback={
                  <div className="h-96 animate-pulse bg-netflix-dark-800 rounded-lg" />
                }
              >
                <MovieReviews movieId={movieId} movieTitle={movie.title} />
              </Suspense>
            </section>
          </ScrollReveal>

          {/* Media Section */}
          <ScrollReveal animation="slideUp" delay={0.1}>
            <section id="media">
              <Suspense
                fallback={
                  <div className="h-96 animate-pulse bg-netflix-dark-800 rounded-lg" />
                }
              >
                <MovieMedia movie={movie} />
              </Suspense>
            </section>
          </ScrollReveal>

          {/* Recommendations Section */}
          {movie.similar?.results && movie.similar.results.length > 0 && (
            <ScrollReveal animation="slideUp" delay={0.1}>
              <Suspense
                fallback={
                  <div className="h-96 animate-pulse bg-netflix-dark-800 rounded-lg" />
                }
              >
                <MovieRecommendations movies={movie.similar.results} />
              </Suspense>
            </ScrollReveal>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading movie:", error);
    notFound();
  }
}

'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { searchMulti, searchMovies, searchSeries } from '@/services/tmdb';
import Link from 'next/link';
import Image from 'next/image';
import { PLACEHOLDER_POSTER_URL } from '@/components/placeholders';
import { Film, Tv, Calendar, Star } from 'lucide-react';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') as 'all' | 'movie' | 'tv' | null;

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', query, type],
    queryFn: () => {
      if (!type || type === 'all') return searchMulti(query);
      if (type === 'movie') return searchMovies(query);
      return searchSeries(query);
    },
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (!query) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-3xl font-bold text-white mb-4">Cerca contenuti</h1>
        <p className="text-slate-400 text-lg">
          Usa la barra di ricerca per trovare film, serie TV e anime
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-slate-400">Ricerca in corso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-4">Errore durante la ricerca</h2>
        <p className="text-slate-400">Riprova più tardi</p>
      </div>
    );
  }

  const results = data?.results || [];
  
  // Filter by media type if specified
  const filteredResults = !type || type === 'all' 
    ? results 
    : results.filter((item: any) => {
        const mediaType = item.media_type || type;
        return mediaType === type;
      });

  if (filteredResults.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Nessun risultato per &quot;{query}&quot;
          {type && type !== 'all' && (
            <span className="block text-lg text-slate-400 mt-2">
              Filtro: {type === 'movie' ? 'Film' : 'Serie TV'}
            </span>
          )}
        </h2>
        <p className="text-slate-400">Prova con altri termini di ricerca o cambia filtro</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Risultati per &quot;{query}&quot;
          {type && type !== 'all' && (
            <span className="text-lg text-slate-400 ml-3">
              ({type === 'movie' ? 'Solo Film' : 'Solo Serie TV'})
            </span>
          )}
        </h1>
        <p className="text-slate-400">
          {filteredResults.length} risultat{filteredResults.length === 1 ? 'o' : 'i'} trovat{filteredResults.length === 1 ? 'o' : 'i'}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredResults.map((item: any) => {
          const isMovie = (item.media_type === 'movie') || type === 'movie';
          const title = item.title || item.name || 'Senza titolo';
          const year = item.release_date || item.first_air_date;
          const posterPath = item.poster_path
            ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
            : PLACEHOLDER_POSTER_URL;

          return (
            <Link
              key={`${item.media_type || type}-${item.id}`}
              href={`/${isMovie ? 'movie' : 'series'}/${item.id}`}
              className="group"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-800">
                <Image
                  src={posterPath}
                  alt={title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {isMovie ? (
                        <Film size={16} className="text-primary" />
                      ) : (
                        <Tv size={16} className="text-accent" />
                      )}
                      <span className="text-xs text-white/80 uppercase">
                        {isMovie ? 'Film' : 'Serie'}
                      </span>
                    </div>
                    
                    {item.vote_average > 0 && (
                      <div className="flex items-center gap-1 text-yellow-500 mb-2">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm font-semibold">
                          {item.vote_average.toFixed(1)}
                        </span>
                      </div>
                    )}
                    
                    {year && (
                      <div className="flex items-center gap-1 text-slate-300">
                        <Calendar size={14} />
                        <span className="text-sm">
                          {new Date(year).getFullYear()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <h3 className="mt-2 text-sm font-medium text-white line-clamp-2 group-hover:text-primary transition-colors">
                {title}
              </h3>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

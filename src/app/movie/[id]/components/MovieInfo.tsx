'use client'

import Image from 'next/image'
import { Clock, DollarSign, Calendar, Film } from 'lucide-react'
import { TMDBMovie } from '@/services/tmdb'
import { tmdb } from '@/services/tmdb'
import { getMovieDirector, getMovieMainCast } from '@/hooks/useMovie'
import { Card } from '@/components/ui/Card'

interface MovieInfoProps {
  movie: TMDBMovie
}

export default function MovieInfo({ movie }: MovieInfoProps) {
  const director = getMovieDirector(movie)
  const mainCast = getMovieMainCast(movie, 10)
  const writers = movie.credits?.crew.filter(person => person.job === 'Writer' || person.job === 'Screenplay')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      {/* Overview */}
      <section>
        <h2 className="text-3xl font-bold mb-4">Trama</h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {movie.overview || 'Nessuna trama disponibile.'}
        </p>
      </section>

      {/* Metadata Bar */}
      <section>
        <h3 className="text-2xl font-bold mb-4">Informazioni</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {movie.runtime && (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Durata</p>
                  <p className="font-semibold">{movie.runtime} min</p>
                </div>
              </div>
            </Card>
          )}

          {movie.release_date && (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Uscita</p>
                  <p className="font-semibold">
                    {new Date(movie.release_date).toLocaleDateString('it-IT')}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {movie.budget > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-semibold">{formatCurrency(movie.budget)}</p>
                </div>
              </div>
            </Card>
          )}

          {movie.revenue > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Film className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Incassi</p>
                  <p className="font-semibold">{formatCurrency(movie.revenue)}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Cast */}
      {mainCast.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold mb-4">Cast Principale</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {mainCast.map((actor) => (
              <Card key={actor.id} className="p-3 hover:shadow-lg transition-shadow">
                <div className="space-y-2">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={tmdb.getProfileUrl(actor.profile_path, 'w185')}
                      alt={actor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-sm line-clamp-1">{actor.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {actor.character}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Crew */}
      <section>
        <h3 className="text-2xl font-bold mb-4">Crew</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {director && (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Regia</p>
              <p className="font-semibold">{director}</p>
            </Card>
          )}

          {writers && writers.length > 0 && (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Sceneggiatura</p>
              <p className="font-semibold">{writers.map(w => w.name).join(', ')}</p>
            </Card>
          )}

          {movie.credits?.crew.find(p => p.job === 'Original Music Composer') && (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Musiche</p>
              <p className="font-semibold">
                {movie.credits.crew.find(p => p.job === 'Original Music Composer')?.name}
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* Production Companies */}
      {movie.production_companies.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold mb-4">Case di Produzione</h3>
          <div className="flex flex-wrap gap-6">
            {movie.production_companies.slice(0, 6).map((company) => (
              <div 
                key={company.id}
                className="flex items-center gap-3 p-4 bg-muted rounded-lg"
              >
                {company.logo_path && (
                  <div className="relative w-20 h-12">
                    <Image
                      src={tmdb.getPosterUrl(company.logo_path, 'w154')}
                      alt={company.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <span className="text-sm font-medium">{company.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Keywords */}
      {movie.keywords?.keywords && movie.keywords.keywords.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {movie.keywords.keywords.slice(0, 15).map((keyword) => (
              <span
                key={keyword.id}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {keyword.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

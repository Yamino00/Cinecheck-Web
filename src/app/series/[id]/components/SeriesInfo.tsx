'use client'

import Image from 'next/image'
import { Tv, Calendar, Network } from 'lucide-react'
import { TMDBSeries } from '@/services/tmdb'
import { tmdb } from '@/services/tmdb'
import { Card } from '@/components/ui/Card'

interface SeriesInfoProps {
  series: TMDBSeries
}

export default function SeriesInfo({ series }: SeriesInfoProps) {
  const creators = series.credits?.crew.filter(person => person.job === 'Creator' || person.job === 'Executive Producer')
  const mainCast = series.credits?.cast.slice(0, 10) || []
  const writers = series.credits?.crew.filter(person => person.job === 'Writer' || person.job === 'Screenplay')

  return (
    <div className="space-y-8">
      {/* Overview */}
      <section>
        <h2 className="text-3xl font-bold mb-4">Trama</h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {series.overview || 'Nessuna trama disponibile.'}
        </p>
      </section>

      {/* Metadata Bar */}
      <section>
        <h3 className="text-2xl font-bold mb-4">Informazioni</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Tv className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Stagioni</p>
                <p className="font-semibold">{series.number_of_seasons}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Tv className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Episodi</p>
                <p className="font-semibold">{series.number_of_episodes}</p>
              </div>
            </div>
          </Card>

          {series.first_air_date && (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Prima messa in onda</p>
                  <p className="font-semibold">
                    {new Date(series.first_air_date).toLocaleDateString('it-IT')}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {series.status && (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Tv className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Stato</p>
                  <p className="font-semibold">{series.status}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Networks */}
      {series.networks && series.networks.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold mb-4">Network</h3>
          <div className="flex flex-wrap gap-4">
            {series.networks.map((network) => (
              <div 
                key={network.id}
                className="flex items-center gap-3 p-4 bg-muted rounded-lg"
              >
                {network.logo_path && (
                  <div className="relative w-20 h-12">
                    <Image
                      src={tmdb.getPosterUrl(network.logo_path, 'w154')}
                      alt={network.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <span className="text-sm font-medium">{network.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

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

      {/* Creators & Crew */}
      {creators && creators.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold mb-4">Crew</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Creatori</p>
              <p className="font-semibold">{creators.slice(0, 3).map(c => c.name).join(', ')}</p>
            </Card>

            {writers && writers.length > 0 && (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Sceneggiatura</p>
                <p className="font-semibold">{writers.slice(0, 2).map(w => w.name).join(', ')}</p>
              </Card>
            )}

            {series.credits?.crew.find(p => p.job === 'Original Music Composer') && (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Musiche</p>
                <p className="font-semibold">
                  {series.credits.crew.find(p => p.job === 'Original Music Composer')?.name}
                </p>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Production Companies */}
      {series.production_companies && series.production_companies.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold mb-4">Case di Produzione</h3>
          <div className="flex flex-wrap gap-6">
            {series.production_companies.slice(0, 6).map((company) => (
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

      {/* Seasons */}
      {series.seasons && series.seasons.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold mb-4">Stagioni</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {series.seasons.filter(season => season.season_number > 0).map((season) => (
              <Card key={season.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <div className="relative w-20 h-28 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={tmdb.getPosterUrl(season.poster_path, 'w185')}
                      alt={season.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold line-clamp-1">{season.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {season.episode_count} episodi
                    </p>
                    {season.air_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(season.air_date).getFullYear()}
                      </p>
                    )}
                    {season.overview && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {season.overview}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Keywords */}
      {series.keywords?.results && series.keywords.results.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {series.keywords.results.slice(0, 15).map((keyword) => (
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

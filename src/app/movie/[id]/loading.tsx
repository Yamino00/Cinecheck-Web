export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <div className="relative h-[70vh] bg-muted animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto flex gap-8">
            {/* Poster Skeleton */}
            <div className="w-64 h-96 bg-muted-foreground/20 rounded-lg flex-shrink-0" />
            {/* Info Skeleton */}
            <div className="flex-1 space-y-4">
              <div className="h-12 w-3/4 bg-muted-foreground/20 rounded" />
              <div className="h-6 w-1/2 bg-muted-foreground/20 rounded" />
              <div className="h-4 w-1/3 bg-muted-foreground/20 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeletons */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  )
}

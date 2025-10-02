// SVG Placeholder components for missing TMDB images
// These provide elegant fallbacks with Cinecheck cinema theme

export function PosterPlaceholder({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 342 513"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="342" height="513" fill="#1a1a1a" />
      <rect x="1" y="1" width="340" height="511" stroke="#333" strokeWidth="2" />
      
      {/* Film strip decoration */}
      <rect x="20" y="40" width="8" height="8" fill="#444" />
      <rect x="20" y="60" width="8" height="8" fill="#444" />
      <rect x="20" y="80" width="8" height="8" fill="#444" />
      <rect x="314" y="40" width="8" height="8" fill="#444" />
      <rect x="314" y="60" width="8" height="8" fill="#444" />
      <rect x="314" y="80" width="8" height="8" fill="#444" />
      
      {/* Film icon */}
      <g transform="translate(171, 200)">
        <rect x="-40" y="-30" width="80" height="60" rx="4" stroke="#666" strokeWidth="2" fill="none" />
        <circle cx="-15" cy="-10" r="8" stroke="#666" strokeWidth="2" fill="none" />
        <circle cx="15" cy="-10" r="8" stroke="#666" strokeWidth="2" fill="none" />
        <path d="M -30 10 L -10 25 L 10 10 L 30 25" stroke="#666" strokeWidth="2" fill="none" />
      </g>
      
      {/* Text */}
      <text x="171" y="280" fontFamily="sans-serif" fontSize="14" fill="#666" textAnchor="middle">
        Poster non disponibile
      </text>
      
      {/* Cinecheck watermark */}
      <text x="171" y="470" fontFamily="sans-serif" fontSize="12" fill="#444" textAnchor="middle" fontWeight="bold">
        CINECHECK
      </text>
    </svg>
  )
}

export function BackdropPlaceholder({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1280 720"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="1280" height="720" fill="#0a0a0a" />
      <rect x="2" y="2" width="1276" height="716" stroke="#222" strokeWidth="4" />
      
      {/* Film strip pattern */}
      {[...Array(20)].map((_, i) => (
        <g key={i}>
          <rect x={60 + i * 60} y="40" width="12" height="12" fill="#1a1a1a" />
          <rect x={60 + i * 60} y="668" width="12" height="12" fill="#1a1a1a" />
        </g>
      ))}
      
      {/* Center cinema icon */}
      <g transform="translate(640, 300)">
        <rect x="-80" y="-60" width="160" height="120" rx="8" stroke="#333" strokeWidth="3" fill="none" />
        <circle cx="-30" cy="-20" r="15" stroke="#333" strokeWidth="3" fill="none" />
        <circle cx="30" cy="-20" r="15" stroke="#333" strokeWidth="3" fill="none" />
        <path d="M -60 20 L -20 50 L 20 20 L 60 50" stroke="#333" strokeWidth="3" fill="none" />
      </g>
      
      <text x="640" y="450" fontFamily="sans-serif" fontSize="24" fill="#444" textAnchor="middle" fontWeight="600">
        Immagine di sfondo non disponibile
      </text>
      
      {/* Bottom decoration */}
      <line x1="400" y1="660" x2="880" y2="660" stroke="#222" strokeWidth="2" />
      <text x="640" y="690" fontFamily="sans-serif" fontSize="18" fill="#333" textAnchor="middle" fontWeight="bold">
        CINECHECK
      </text>
    </svg>
  )
}

export function ProfilePlaceholder({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 185 278"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="185" height="278" fill="#1a1a1a" />
      <rect x="1" y="1" width="183" height="276" stroke="#333" strokeWidth="2" />
      
      {/* User silhouette */}
      <circle cx="92.5" cy="90" r="35" fill="#444" />
      <path
        d="M 40 200 Q 40 150 92.5 150 Q 145 150 145 200 L 145 240 L 40 240 Z"
        fill="#444"
      />
      
      {/* Text */}
      <text x="92.5" y="260" fontFamily="sans-serif" fontSize="11" fill="#666" textAnchor="middle">
        Foto non disponibile
      </text>
    </svg>
  )
}

// Data URLs for direct use in Image src (base64 encoded minimal SVG)
export const PLACEHOLDER_POSTER_URL = "data:image/svg+xml,%3Csvg viewBox='0 0 342 513' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='342' height='513' fill='%231a1a1a'/%3E%3Ctext x='171' y='256' font-family='sans-serif' font-size='14' fill='%23666' text-anchor='middle'%3EPoster non disponibile%3C/text%3E%3C/svg%3E"

export const PLACEHOLDER_BACKDROP_URL = "data:image/svg+xml,%3Csvg viewBox='0 0 1280 720' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1280' height='720' fill='%230a0a0a'/%3E%3Ctext x='640' y='360' font-family='sans-serif' font-size='24' fill='%23444' text-anchor='middle'%3EImmagine non disponibile%3C/text%3E%3C/svg%3E"

export const PLACEHOLDER_PROFILE_URL = "data:image/svg+xml,%3Csvg viewBox='0 0 185 278' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='185' height='278' fill='%231a1a1a'/%3E%3Ccircle cx='92.5' cy='90' r='35' fill='%23444'/%3E%3Cpath d='M 40 200 Q 40 150 92.5 150 Q 145 150 145 200 L 145 240 L 40 240 Z' fill='%23444'/%3E%3C/svg%3E"

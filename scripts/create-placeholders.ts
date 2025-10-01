// Script per generare placeholder immagini ottimizzate
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const createPlaceholderImages = async () => {
  const publicDir = path.join(process.cwd(), 'public', 'images')
  
  // Crea directory se non esiste
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  // Placeholder per poster (2:3 ratio)
  const posterPlaceholder = await sharp({
    create: {
      width: 400,
      height: 600,
      channels: 3,
      background: { r: 30, g: 41, b: 59 } // slate-800
    }
  })
  .composite([
    {
      input: Buffer.from(`
        <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#334155;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#475569;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#64748b;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#gradient)" />
          <circle cx="200" cy="250" r="40" fill="#64748b" opacity="0.5"/>
          <rect x="160" y="320" width="80" height="8" rx="4" fill="#64748b" opacity="0.3"/>
          <rect x="140" y="340" width="120" height="8" rx="4" fill="#64748b" opacity="0.3"/>
          <rect x="170" y="360" width="60" height="8" rx="4" fill="#64748b" opacity="0.3"/>
        </svg>
      `),
      top: 0,
      left: 0,
    }
  ])
  .webp({ quality: 80 })
  .toFile(path.join(publicDir, 'poster-placeholder.webp'))

  // Anche versione JPEG fallback
  await sharp({
    create: {
      width: 400,
      height: 600,
      channels: 3,
      background: { r: 30, g: 41, b: 59 }
    }
  })
  .composite([
    {
      input: Buffer.from(`
        <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#334155;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#475569;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#64748b;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#gradient)" />
          <circle cx="200" cy="250" r="40" fill="#64748b" opacity="0.5"/>
          <rect x="160" y="320" width="80" height="8" rx="4" fill="#64748b" opacity="0.3"/>
          <rect x="140" y="340" width="120" height="8" rx="4" fill="#64748b" opacity="0.3"/>
          <rect x="170" y="360" width="60" height="8" rx="4" fill="#64748b" opacity="0.3"/>
        </svg>
      `),
      top: 0,
      left: 0,
    }
  ])
  .jpeg({ quality: 80 })
  .toFile(path.join(publicDir, 'poster-placeholder.jpg'))

  console.log('✅ Placeholder images created successfully!')
}

createPlaceholderImages().catch(console.error)
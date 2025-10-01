'use client'

import { motion } from 'framer-motion'
import { FilmIcon, WifiIcon, ArrowPathIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/Button'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        {/* Animated offline icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <WifiIcon className="w-24 h-24 text-gray-600 mx-auto" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
            >
              <span className="text-white text-sm font-bold">✕</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-3xl font-bold mb-4"
        >
          Sei offline
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-gray-400 mb-8 leading-relaxed"
        >
          Non riesci a connetterti a internet. Controlla la tua connessione e riprova.
          <br />
          <br />
          Alcune funzionalità potrebbero essere disponibili offline.
        </motion.p>

        {/* Cached content info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="bg-slate-800 rounded-lg p-4 mb-8"
        >
          <FilmIcon className="w-8 h-8 text-primary-500 mx-auto mb-2" />
          <p className="text-sm text-gray-300">
            Alcuni contenuti potrebbero essere ancora disponibili dalla cache del tuo browser.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="space-y-4"
        >
          <Button
            onClick={handleRetry}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Riprova
          </Button>

          <Button
            onClick={handleGoHome}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 py-3 px-6 rounded-lg font-semibold"
          >
            Torna alla Home
          </Button>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-8 text-xs text-gray-500"
        >
          <p>💡 Suggerimento: Quando sei online, l'app salva automaticamente i contenuti per l'uso offline</p>
        </motion.div>
      </div>
    </div>
  )
}
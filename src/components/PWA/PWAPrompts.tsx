'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, DevicePhoneMobileIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/Button'
import { usePWA } from '@/hooks/usePWA'

export function PWAInstallPrompt() {
  const { showInstallPrompt, install, hideInstallPrompt, isInstallable } = usePWA()

  if (!showInstallPrompt || !isInstallable) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm"
      >
        <div className="bg-slate-900/95 backdrop-blur-lg border border-white/10 rounded-xl p-4 shadow-2xl">
          {/* Close button */}
          <button
            onClick={hideInstallPrompt}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                <DevicePhoneMobileIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 pr-6">
              <h3 className="text-white font-semibold text-sm mb-1">
                Installa Cinecheck
              </h3>
              <p className="text-gray-300 text-xs mb-3 leading-relaxed">
                Aggiungi l'app alla schermata home per un accesso rapido e funzioni offline.
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={install}
                  size="sm"
                  className="bg-primary-600 hover:bg-primary-700 text-white text-xs px-3 py-1.5 flex items-center gap-1"
                >
                  <ArrowDownTrayIcon className="w-3 h-3" />
                  Installa
                </Button>
                <Button
                  onClick={hideInstallPrompt}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 text-xs px-3 py-1.5"
                >
                  Non ora
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Status indicator per PWA
export function PWAStatus() {
  const { isInstalled, isOnline } = usePWA()

  if (!isInstalled) return null

  return (
    <div className="fixed top-20 right-4 z-40">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
          isOnline
            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
            : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-orange-400'}`} />
        {isOnline ? 'Online' : 'Offline'}
      </motion.div>
    </div>
  )
}

// Componente per mostrare quando ci sono aggiornamenti disponibili
export function PWAUpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowUpdate(true)
      })
    }
  }, [])

  const handleUpdate = () => {
    window.location.reload()
  }

  if (!showUpdate) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-20 left-4 right-4 z-50 mx-auto max-w-sm"
      >
        <div className="bg-blue-600/95 backdrop-blur-lg rounded-lg p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium text-sm">Aggiornamento disponibile</p>
              <p className="text-blue-100 text-xs">Una nuova versione dell'app è pronta</p>
            </div>
            <Button
              onClick={handleUpdate}
              size="sm"
              className="bg-white text-blue-600 hover:bg-blue-50 text-xs px-3 py-1.5 ml-3"
            >
              Ricarica
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
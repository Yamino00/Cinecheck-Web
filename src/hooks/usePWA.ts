'use client'

import { useEffect, useState } from 'react'

interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface UsePWAReturn {
  isSupported: boolean
  isInstalled: boolean
  isInstallable: boolean
  isOnline: boolean
  install: () => Promise<void>
  showInstallPrompt: boolean
  hideInstallPrompt: () => void
}

export function usePWA(): UsePWAReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      setIsSupported(true)
      registerServiceWorker()
    }

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as any)
      setIsInstallable(true)
      
      // Show install prompt after 30 seconds if not already shown
      setTimeout(() => {
        if (!isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
          setShowInstallPrompt(true)
        }
      }, 30000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for app installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setShowInstallPrompt(false)
      console.log('PWA installed successfully')
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      console.log('Service Worker registered successfully:', registration)

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('New service worker available')
              // You can show a notification to user about update
            }
          })
        }
      })

      // Check for waiting service worker
      if (registration.waiting) {
        // New service worker is available and waiting
        console.log('New service worker waiting')
      }

    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  const install = async (): Promise<void> => {
    if (!deferredPrompt) {
      console.log('No install prompt available')
      return
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      console.log(`User response to install prompt: ${outcome}`)
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
      }
      
      setDeferredPrompt(null)
      setIsInstallable(false)
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('Error during installation:', error)
    }
  }

  const hideInstallPrompt = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  return {
    isSupported,
    isInstalled,
    isInstallable,
    isOnline,
    install,
    showInstallPrompt,
    hideInstallPrompt,
  }
}

// Hook for offline storage
export function useOfflineStorage() {
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported('indexedDB' in window)
  }, [])

  const saveOfflineData = async (key: string, data: any) => {
    if (!isSupported) return false

    try {
      const db = await openDB()
      const transaction = db.transaction(['offline-data'], 'readwrite')
      const store = transaction.objectStore('offline-data')
      
      await store.put(data, key)
      console.log(`Offline data saved: ${key}`)
      return true
    } catch (error) {
      console.error('Error saving offline data:', error)
      return false
    }
  }

  const getOfflineData = async (key: string) => {
    if (!isSupported) return null

    try {
      const db = await openDB()
      const transaction = db.transaction(['offline-data'], 'readonly')
      const store = transaction.objectStore('offline-data')
      
      const result = await store.get(key)
      return result || null
    } catch (error) {
      console.error('Error getting offline data:', error)
      return null
    }
  }

  const removeOfflineData = async (key: string) => {
    if (!isSupported) return false

    try {
      const db = await openDB()
      const transaction = db.transaction(['offline-data'], 'readwrite')
      const store = transaction.objectStore('offline-data')
      
      await store.delete(key)
      console.log(`Offline data removed: ${key}`)
      return true
    } catch (error) {
      console.error('Error removing offline data:', error)
      return false
    }
  }

  return {
    isSupported,
    saveOfflineData,
    getOfflineData,
    removeOfflineData,
  }
}

// Helper function to open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cinecheck-offline', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = () => {
      const db = request.result
      
      // Create object stores
      if (!db.objectStoreNames.contains('offline-data')) {
        db.createObjectStore('offline-data')
      }
      
      if (!db.objectStoreNames.contains('offline-reviews')) {
        const reviewsStore = db.createObjectStore('offline-reviews', { keyPath: 'id' })
        reviewsStore.createIndex('contentId', 'contentId', { unique: false })
      }
    }
  })
}
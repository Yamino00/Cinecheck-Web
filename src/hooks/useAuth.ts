'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Ottieni la sessione corrente
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)

      // Se l'utente è autenticato, verifica che abbia un profilo
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single()

        // Se il profilo non esiste, crealo usando insert diretto
        if (!profile) {
          console.log('Profile not found, creating...')
          const username = session.user.email?.split('@')[0] || 'user'

          const { error } = await (supabase.from('profiles') as any)
            .insert({
              id: session.user.id,
              username: username,
              display_name: username,
              reliability_score: 0,
              total_reviews: 0,
              verified_reviews: 0,
              quiz_success_rate: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (error) {
            console.error('Error creating profile:', error)
          } else {
            console.log('Profile created successfully')
          }
        }
      }

      setLoading(false)
    })

    // Ascolta i cambiamenti di autenticazione
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)

      // Se l'utente fa login, verifica che abbia un profilo
      if (session?.user && _event === 'SIGNED_IN') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single()

        if (!profile) {
          console.log('Profile not found on sign in, creating...')
          const username = session.user.email?.split('@')[0] || 'user'

          await (supabase.from('profiles') as any).insert({
            id: session.user.id,
            username: username,
            display_name: username,
            reliability_score: 0,
            total_reviews: 0,
            verified_reviews: 0,
            quiz_success_rate: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  }
}

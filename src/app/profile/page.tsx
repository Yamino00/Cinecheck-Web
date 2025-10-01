'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  UserCircleIcon, 
  FilmIcon, 
  StarIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/solid'

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <FilmIcon className="h-16 w-16 text-primary" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Il tuo Profilo
          </h1>
          <p className="text-slate-400">Benvenuto su Cinecheck, {user?.user_metadata?.username || 'utente'}!</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircleIcon className="h-6 w-6 text-primary" />
                  Informazioni Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Username</p>
                  <p className="text-lg font-semibold">{user?.user_metadata?.username || 'Non disponibile'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-lg font-semibold">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Registrato il</p>
                  <p className="text-lg font-semibold">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('it-IT') : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StarIcon className="h-6 w-6 text-accent" />
                  Statistiche
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Recensioni</span>
                  <span className="text-2xl font-bold text-primary">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Film visti</span>
                  <span className="text-2xl font-bold text-accent">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Affidabilità</span>
                  <span className="text-2xl font-bold text-green-500">0%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Button
            onClick={signOut}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Logout
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

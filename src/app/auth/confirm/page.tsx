'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { EnvelopeIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function ConfirmPage() {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Sfondo animato */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bg-primary/10 rounded-full -top-20 -left-40 w-96 h-96 blur-3xl animate-pulse"></div>
        <div className="absolute bg-accent/10 rounded-full -bottom-20 -right-40 w-96 h-96 blur-3xl animate-pulse delay-500"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10"
      >
        <Card variant="glass" className="w-full max-w-md text-center">
          <CardHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
              className="mx-auto mb-4"
            >
              <EnvelopeIcon className="h-16 w-16 text-primary" />
            </motion.div>
            <CardTitle>Controlla la tua email</CardTitle>
            <CardDescription>
              Ti abbiamo inviato un link per confermare il tuo account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 mb-6">
              Se non vedi l'email, controlla la cartella spam.
            </p>
            <Link href="/">
              <Button variant="premium">
                Torna alla Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

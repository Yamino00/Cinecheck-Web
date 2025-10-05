"use client";

import { motion } from "framer-motion";
import { X, Play, Trophy, Clock, BookOpen } from "lucide-react";

interface QuizStartProps {
  contentTitle: string;
  onStart: () => void;
  onClose: () => void;
}

export default function QuizStart({
  contentTitle,
  onStart,
  onClose,
}: QuizStartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-netflix-dark-950 rounded-xl p-8 shadow-2xl max-w-2xl w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-netflix-600 rounded-lg flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Quiz Challenge</h2>
            <p className="text-sm text-gray-400">Testa la tua conoscenza</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
          aria-label="Chiudi"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Title del contenuto */}
      <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white">{contentTitle}</h3>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Numero domande */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-5 h-5 text-netflix-600" />
            <span className="text-sm text-gray-400">Domande</span>
          </div>
          <p className="text-2xl font-bold text-white">10</p>
        </div>

        {/* Tempo */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-netflix-600" />
            <span className="text-sm text-gray-400">Tempo/domanda</span>
          </div>
          <p className="text-2xl font-bold text-white">30s</p>
        </div>

        {/* Punteggio */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-accent-500" />
            <span className="text-sm text-gray-400">Punteggio Max</span>
          </div>
          <p className="text-2xl font-bold text-white">80 pt</p>
        </div>

        {/* Soglia */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Play className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-400">Per superare</span>
          </div>
          <p className="text-2xl font-bold text-white">60%</p>
        </div>
      </div>

      {/* Distribuzione difficoltà */}
      <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
        <h4 className="text-sm font-semibold text-white mb-3">
          Distribuzione Difficoltà
        </h4>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-green-500/20 rounded-full px-3 py-2 text-center border border-green-500/30">
            <span className="text-sm font-semibold text-green-400">
              5 Facili
            </span>
          </div>
          <div className="flex-1 bg-yellow-500/20 rounded-full px-3 py-2 text-center border border-yellow-500/30">
            <span className="text-sm font-semibold text-yellow-400">
              4 Medie
            </span>
          </div>
          <div className="flex-1 bg-red-500/20 rounded-full px-3 py-2 text-center border border-red-500/30">
            <span className="text-sm font-semibold text-red-400">
              1 Difficile
            </span>
          </div>
        </div>
      </div>

      {/* Regole */}
      <div className="bg-netflix-600/10 border border-netflix-600/30 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-semibold text-netflix-600 mb-3 flex items-center gap-2">
          <span>📌</span> Regole del Quiz
        </h4>
        <ul className="text-sm text-gray-300 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-netflix-600 font-bold">•</span>
            <span>Ogni domanda ha 4 possibili risposte</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-netflix-600 font-bold">•</span>
            <span>Il punteggio varia in base alla difficoltà</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-netflix-600 font-bold">•</span>
            <span>Hai 30 secondi per rispondere a ogni domanda</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-netflix-600 font-bold">•</span>
            <span>Non puoi tornare indietro dopo aver risposto</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-netflix-600 font-bold">•</span>
            <span>
              Se il tempo scade, la domanda viene conteggiata come errata
            </span>
          </li>
        </ul>
      </div>

      {/* Bottoni */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="flex-1 bg-netflix-600 hover:bg-netflix-700 text-white font-bold py-4 px-6 rounded-lg transition shadow-lg flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>Inizia Quiz</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-lg transition border border-white/10"
        >
          Annulla
        </motion.button>
      </div>
    </motion.div>
  );
}

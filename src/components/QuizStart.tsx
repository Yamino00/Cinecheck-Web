"use client";

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
    <div className="bg-gray-900 rounded-lg p-8 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Quiz</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition"
          aria-label="Chiudi"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Contenuto */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">
          {contentTitle}
        </h3>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-purple-400 mb-4">
            📋 Informazioni Quiz
          </h4>

          <div className="space-y-3 text-gray-300">
            <div className="flex items-center justify-between">
              <span>Numero di domande:</span>
              <span className="font-semibold text-white">8 domande</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Distribuzione difficoltà:</span>
              <div className="flex gap-2 text-sm">
                <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded">
                  3 Facili
                </span>
                <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded">
                  3 Medie
                </span>
                <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded">
                  2 Difficili
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Punteggio totale:</span>
              <span className="font-semibold text-white">80 punti</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Per superare il quiz:</span>
              <span className="font-semibold text-purple-400">
                48 punti (60%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Tempo per domanda:</span>
              <span className="font-semibold text-white">30 secondi</span>
            </div>
          </div>
        </div>

        {/* Regole */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-400 mb-2">
            📌 Regole
          </h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Ogni domanda ha 4 possibili risposte</li>
            <li>• Il punteggio varia in base alla difficoltà</li>
            <li>• Hai 30 secondi per rispondere a ogni domanda</li>
            <li>• Non puoi tornare indietro dopo aver risposto</li>
            <li>
              • Se il tempo scade, la domanda viene conteggiata come errata
            </li>
          </ul>
        </div>
      </div>

      {/* Bottoni */}
      <div className="flex gap-4">
        <button
          onClick={onStart}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-lg transition transform hover:scale-105 shadow-lg"
        >
          🚀 Inizia Quiz
        </button>
        <button
          onClick={onClose}
          className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition"
        >
          Annulla
        </button>
      </div>
    </div>
  );
}

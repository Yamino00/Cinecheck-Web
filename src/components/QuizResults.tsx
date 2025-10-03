"use client";

import type { QuizResult } from "./QuizContainer";

interface QuizResultsProps {
  result: QuizResult;
  contentTitle: string;
  onRetry: () => void;
  onClose: () => void;
}

export default function QuizResults({
  result,
  contentTitle,
  onRetry,
  onClose,
}: QuizResultsProps) {
  const getDifficultyEmoji = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "🟢";
      case "medium":
        return "🟡";
      case "hard":
        return "🔴";
      default:
        return "⚪";
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{result.passed ? "🎉" : "😔"}</div>
        <h2 className="text-3xl font-bold text-white mb-2">
          {result.passed ? "Quiz Superato!" : "Non Superato"}
        </h2>
        <p className="text-gray-400">{contentTitle}</p>
      </div>

      {/* Punteggio principale */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Punteggio Totale</p>
            <p className="text-4xl font-bold text-white">
              {result.score} / {result.totalPoints}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm mb-1">Percentuale</p>
            <p
              className={`text-4xl font-bold ${
                result.passed ? "text-green-400" : "text-red-400"
              }`}
            >
              {result.percentage}%
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Risposte corrette: {result.correctAnswers} / {result.totalQuestions}
          </span>
          <span
            className={`font-semibold ${
              result.passed ? "text-green-400" : "text-red-400"
            }`}
          >
            {result.passed
              ? "✓ Soglia superata (60%)"
              : "✗ Sotto la soglia (60%)"}
          </span>
        </div>
      </div>

      {/* Performance per difficoltà */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          📊 Performance per Difficoltà
        </h3>

        <div className="space-y-4">
          {/* Facili */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 font-semibold">🟢 Facili</span>
              <span className="text-white">
                {result.performance.easy.correct} /{" "}
                {result.performance.easy.total}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{
                  width: `${
                    result.performance.easy.total > 0
                      ? (result.performance.easy.correct /
                          result.performance.easy.total) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Medie */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-400 font-semibold">🟡 Medie</span>
              <span className="text-white">
                {result.performance.medium.correct} /{" "}
                {result.performance.medium.total}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all"
                style={{
                  width: `${
                    result.performance.medium.total > 0
                      ? (result.performance.medium.correct /
                          result.performance.medium.total) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Difficili */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-400 font-semibold">🔴 Difficili</span>
              <span className="text-white">
                {result.performance.hard.correct} /{" "}
                {result.performance.hard.total}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{
                  width: `${
                    result.performance.hard.total > 0
                      ? (result.performance.hard.correct /
                          result.performance.hard.total) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Review domande */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          📝 Revisione Risposte
        </h3>

        <div className="space-y-4">
          {result.answeredQuestions.map((q, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                q.isCorrect
                  ? "bg-green-900/20 border-green-500/30"
                  : "bg-red-900/20 border-red-500/30"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{q.isCorrect ? "✓" : "✗"}</span>
                    <span className="text-sm">
                      {getDifficultyEmoji(q.difficulty)}
                    </span>
                    <span className="text-gray-400 text-sm font-semibold">
                      Domanda {index + 1}
                    </span>
                  </div>
                  <p className="text-white font-medium mb-3">{q.question}</p>
                </div>
                <span
                  className={`text-lg font-bold ${
                    q.isCorrect ? "text-green-400" : "text-gray-500"
                  }`}
                >
                  {q.isCorrect ? `+${q.points}` : "0"} pt
                </span>
              </div>

              <div className="space-y-2 text-sm">
                {q.userAnswer && (
                  <div>
                    <span className="text-gray-400">La tua risposta: </span>
                    <span
                      className={
                        q.isCorrect ? "text-green-400" : "text-red-400"
                      }
                    >
                      {q.userAnswer}
                    </span>
                  </div>
                )}

                {!q.isCorrect && (
                  <div>
                    <span className="text-gray-400">Risposta corretta: </span>
                    <span className="text-green-400">{q.correctAnswer}</span>
                  </div>
                )}

                {!q.userAnswer && (
                  <div>
                    <span className="text-red-400">
                      ⚠️ Nessuna risposta fornita (tempo scaduto)
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottoni azione */}
      <div className="flex gap-4">
        <button
          onClick={onRetry}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-lg transition transform hover:scale-105 shadow-lg"
        >
          🔄 Riprova Quiz
        </button>
        <button
          onClick={onClose}
          className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition"
        >
          ← Torna al Contenuto
        </button>
      </div>
    </div>
  );
}

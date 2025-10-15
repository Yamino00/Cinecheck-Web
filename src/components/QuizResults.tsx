"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  RotateCcw,
  X,
  TrendingUp,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
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
  // Log per debugging
  console.log("🎯 QuizResults Component Mounted!", {
    result,
    contentTitle,
    hasResult: !!result,
    questionsCount: result?.answeredQuestions?.length,
  });

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return {
          emoji: "🟢",
          color: "text-green-400",
          bg: "bg-green-500/20",
          border: "border-green-500/30",
        };
      case "medium":
        return {
          emoji: "🟡",
          color: "text-yellow-400",
          bg: "bg-yellow-500/20",
          border: "border-yellow-500/30",
        };
      case "hard":
        return {
          emoji: "🔴",
          color: "text-red-400",
          bg: "bg-red-500/20",
          border: "border-red-500/30",
        };
      default:
        return {
          emoji: "⚪",
          color: "text-gray-400",
          bg: "bg-white/5",
          border: "border-white/10",
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-netflix-dark-950 rounded-xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto max-w-4xl w-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={
              "w-12 h-12 rounded-lg flex items-center justify-center " +
              (result.passed ? "bg-green-600" : "bg-netflix-600")
            }
          >
            {result.passed ? (
              <Trophy className="w-6 h-6 text-white" />
            ) : (
              <Target className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {result.passed ? "Quiz Superato!" : "Quiz Non Superato"}
            </h2>
            <p className="text-sm text-gray-400">{contentTitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Emoji celebrazione */}
      <div className="text-center mb-6">
        <div className="text-7xl mb-2">{result.passed ? "🎉" : "😔"}</div>
        {result.isNewQuiz && result.generationReason === 'all_quizzes_completed' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full"
          >
            <span className="text-purple-400 text-sm font-medium">
              🎆 Quiz esclusivo creato per te!
            </span>
          </motion.div>
        )}
      </div>

      {/* Punteggio principale */}
      <div
        className={
          "rounded-xl p-6 mb-6 border-2 " +
          (result.passed
            ? "bg-green-600/10 border-green-600/30"
            : "bg-netflix-600/10 border-netflix-600/30")
        }
      >
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2 flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>Punteggio</span>
            </p>
            <p className="text-5xl font-bold text-white">{result.score}</p>
            <p className="text-gray-400 text-sm">su {result.totalPoints} pt</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2 flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Percentuale</span>
            </p>
            <p
              className={
                "text-5xl font-bold " +
                (result.passed ? "text-green-400" : "text-netflix-600")
              }
            >
              {result.percentage}%
            </p>
            <p
              className={
                "text-sm font-semibold " +
                (result.passed ? "text-green-400" : "text-netflix-600")
              }
            >
              {result.passed ? " Superata" : " Non superata"}
            </p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>
              Corrette:{" "}
              <span className="font-bold text-white">
                {result.correctAnswers}
              </span>{" "}
              / {result.totalQuestions}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <XCircle className="w-4 h-4 text-red-400" />
            <span>
              Sbagliate:{" "}
              <span className="font-bold text-white">
                {result.totalQuestions - result.correctAnswers}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Performance per difficoltà */}
      <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-netflix-600" />
          <span>Performance per Difficoltà</span>
        </h3>
        <div className="space-y-5">
          {/* Facili */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 font-semibold flex items-center gap-2">
                <span>🟢</span> Facili
              </span>
              <span className="text-white font-bold">
                {result.performance.easy.correct} /{" "}
                {result.performance.easy.total}
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width:
                    result.performance.easy.total > 0
                      ? `${
                          (result.performance.easy.correct /
                            result.performance.easy.total) *
                          100
                        }%`
                      : "0%",
                }}
                className="bg-green-500 h-3 rounded-full"
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>
          </div>

          {/* Medie */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-400 font-semibold flex items-center gap-2">
                <span>🟡</span> Medie
              </span>
              <span className="text-white font-bold">
                {result.performance.medium.correct} /{" "}
                {result.performance.medium.total}
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width:
                    result.performance.medium.total > 0
                      ? `${
                          (result.performance.medium.correct /
                            result.performance.medium.total) *
                          100
                        }%`
                      : "0%",
                }}
                className="bg-yellow-500 h-3 rounded-full"
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>

          {/* Difficili */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-400 font-semibold flex items-center gap-2">
                <span>🔴</span> Difficili
              </span>
              <span className="text-white font-bold">
                {result.performance.hard.correct} /{" "}
                {result.performance.hard.total}
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width:
                    result.performance.hard.total > 0
                      ? `${
                          (result.performance.hard.correct /
                            result.performance.hard.total) *
                          100
                        }%`
                      : "0%",
                }}
                className="bg-red-500 h-3 rounded-full"
                transition={{ duration: 0.8, delay: 0.4 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Review domande */}
      <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-netflix-600" />
          <span>Revisione Risposte</span>
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {result.answeredQuestions.map((q, index) => {
            const config = getDifficultyConfig(q.difficulty);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg border-2 ${
                  q.isCorrect
                    ? "bg-green-600/10 border-green-600/30"
                    : "bg-red-600/10 border-red-600/30"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        q.isCorrect ? "bg-green-600" : "bg-red-600"
                      }`}
                    >
                      {q.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        <XCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs">{config.emoji}</span>
                        <span className="text-gray-400 text-sm font-semibold">
                          Domanda {index + 1}
                        </span>
                      </div>
                      <p className="text-white font-medium text-sm">
                        {q.question}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-lg font-bold flex-shrink-0 ${
                      q.isCorrect ? "text-green-400" : "text-gray-500"
                    }`}
                  >
                    {q.isCorrect ? `+${q.points}` : "0"}
                  </span>
                </div>
                <div className="ml-11 space-y-2 text-sm">
                  {q.userAnswer ? (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 flex-shrink-0">
                        Tua risposta:
                      </span>
                      <span
                        className={`font-medium ${
                          q.isCorrect ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {q.userAnswer}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">
                        Tempo scaduto - Nessuna risposta
                      </span>
                    </div>
                  )}
                  {!q.isCorrect && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 flex-shrink-0">
                        Risposta corretta:
                      </span>
                      <span className="text-green-400 font-medium">
                        {q.correctAnswer}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottoni azione */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRetry}
          className="flex-1 bg-netflix-600 hover:bg-netflix-700 text-white font-bold py-4 px-6 rounded-lg transition shadow-lg flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          <span>{result.passed ? "Prova Altro Quiz" : "Prova Quiz Diverso"}</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-lg transition border border-white/10 flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          <span>Chiudi</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

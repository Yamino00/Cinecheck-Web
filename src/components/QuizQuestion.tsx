"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Zap, ChevronRight, CheckCircle2 } from "lucide-react";
import type { QuizQuestion as QuizQuestionType } from "./QuizContainer";

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  timeRemaining: number;
  onAnswer: (answer: string) => void;
  selectedAnswer: string;
}

export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  timeRemaining,
  onAnswer,
  selectedAnswer,
}: QuizQuestionProps) {
  const [currentSelection, setCurrentSelection] = useState(selectedAnswer);

  const handleAnswerClick = (answer: string) => {
    setCurrentSelection(answer);
  };

  const handleSubmit = () => {
    onAnswer(currentSelection);
  };

  // Determina il colore del timer
  const getTimerColor = () => {
    if (timeRemaining > 20) return "text-green-400";
    if (timeRemaining > 10) return "text-yellow-400";
    return "text-netflix-600";
  };

  const getTimerBgColor = () => {
    if (timeRemaining > 20) return "bg-green-500/20 border-green-500/30";
    if (timeRemaining > 10) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-netflix-600/20 border-netflix-600/30";
  };

  // Determina il colore del badge difficoltà
  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return {
          color: "bg-green-500/20 text-green-400 border-green-500/30",
          label: "Facile",
          icon: "🟢",
        };
      case "medium":
        return {
          color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          label: "Media",
          icon: "🟡",
        };
      case "hard":
        return {
          color: "bg-red-500/20 text-red-400 border-red-500/30",
          label: "Difficile",
          icon: "🔴",
        };
      default:
        return {
          color: "bg-white/10 text-gray-400 border-white/20",
          label: difficulty,
          icon: "⚪",
        };
    }
  };

  const difficultyConfig = getDifficultyConfig(question.difficulty);
  const progressPercentage = (questionNumber / totalQuestions) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-netflix-dark-950 rounded-xl p-8 shadow-2xl max-w-3xl w-full"
    >
      {/* Header con progresso e timer */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <span className="text-white font-bold text-sm">
              {questionNumber} / {totalQuestions}
            </span>
          </div>
          <div
            className={`px-3 py-2 rounded-lg text-sm font-semibold border ${difficultyConfig.color} flex items-center gap-2`}
          >
            <span>{difficultyConfig.icon}</span>
            <span>{difficultyConfig.label}</span>
            <span className="text-xs opacity-75">• {question.points} pt</span>
          </div>
        </div>

        {/* Timer */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getTimerBgColor()}`}
        >
          <Clock className={`w-5 h-5 ${getTimerColor()}`} />
          <span
            className={`text-2xl font-bold tabular-nums ${getTimerColor()}`}
          >
            {timeRemaining}
          </span>
        </div>
      </div>

      {/* Barra di progresso */}
      <div className="w-full bg-white/5 rounded-full h-2 mb-8 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          className="bg-netflix-600 h-2 rounded-full"
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Domanda */}
      <div className="mb-8">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-netflix-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white leading-relaxed flex-1">
            {question.question}
          </h3>
        </div>

        {/* Risposte */}
        <div className="space-y-3">
          {question.answers.map((answer, index) => {
            const isSelected = currentSelection === answer;
            const letters = ["A", "B", "C", "D"];

            return (
              <motion.button
                key={index}
                onClick={() => handleAnswerClick(answer)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "bg-netflix-600 border-netflix-600 text-white shadow-lg shadow-netflix-600/20"
                    : "bg-white/5 border-white/10 text-gray-300 hover:border-netflix-600/50 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      isSelected
                        ? "bg-white text-netflix-600"
                        : "bg-white/10 text-gray-400 border border-white/20"
                    }`}
                  >
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      letters[index]
                    )}
                  </div>
                  <span className="flex-1 font-medium text-base">{answer}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottone submit */}
      <div className="flex justify-end gap-3">
        <motion.button
          whileHover={{ scale: currentSelection ? 1.02 : 1 }}
          whileTap={{ scale: currentSelection ? 0.98 : 1 }}
          onClick={handleSubmit}
          disabled={!currentSelection}
          className={`px-8 py-4 rounded-lg font-bold transition flex items-center gap-2 ${
            currentSelection
              ? "bg-netflix-600 hover:bg-netflix-700 text-white shadow-lg"
              : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/10"
          }`}
        >
          <span>
            {questionNumber === totalQuestions
              ? "Termina Quiz"
              : "Prossima Domanda"}
          </span>
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Avviso tempo */}
      {timeRemaining <= 10 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <div className="bg-netflix-600/20 border border-netflix-600/30 rounded-lg px-4 py-3">
            <p className="text-netflix-600 text-sm font-semibold flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>Tempo in scadenza! Rispondi rapidamente</span>
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

"use client";

import { useState } from "react";
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
    return "text-red-400";
  };

  // Determina il colore del badge difficoltà
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-600/20 text-green-400 border-green-500/30";
      case "medium":
        return "bg-yellow-600/20 text-yellow-400 border-yellow-500/30";
      case "hard":
        return "bg-red-600/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-600/20 text-gray-400 border-gray-500/30";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Facile";
      case "medium":
        return "Media";
      case "hard":
        return "Difficile";
      default:
        return difficulty;
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-8 shadow-2xl">
      {/* Header con progresso e timer */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-gray-400 font-semibold">
            Domanda {questionNumber} / {totalQuestions}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(
              question.difficulty
            )}`}
          >
            {getDifficultyLabel(question.difficulty)} • {question.points} pt
          </span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <svg
            className={`w-6 h-6 ${getTimerColor()}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className={`text-2xl font-bold ${getTimerColor()}`}>
            {timeRemaining}s
          </span>
        </div>
      </div>

      {/* Barra di progresso */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
        <div
          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${(questionNumber / totalQuestions) * 100}%`,
          }}
        />
      </div>

      {/* Domanda */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-6 leading-relaxed">
          {question.question}
        </h3>

        {/* Risposte */}
        <div className="space-y-3">
          {question.answers.map((answer, index) => {
            const isSelected = currentSelection === answer;
            const letters = ["A", "B", "C", "D"];

            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(answer)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "bg-purple-600 border-purple-500 text-white shadow-lg transform scale-105"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500/50 hover:bg-gray-750"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      isSelected
                        ? "bg-white text-purple-600"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {letters[index]}
                  </span>
                  <span className="flex-1 font-medium">{answer}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottone submit */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!currentSelection}
          className={`px-8 py-3 rounded-lg font-bold transition ${
            currentSelection
              ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transform hover:scale-105"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
        >
          {questionNumber === totalQuestions ? "✓ Termina Quiz" : "→ Prossima"}
        </button>
      </div>

      {/* Avviso tempo */}
      {timeRemaining <= 10 && (
        <div className="mt-4 text-center">
          <p className="text-red-400 text-sm font-semibold animate-pulse">
            ⚠️ Tempo in scadenza! Rispondi rapidamente
          </p>
        </div>
      )}
    </div>
  );
}

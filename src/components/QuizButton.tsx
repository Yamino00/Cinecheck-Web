"use client";

import { useState } from "react";
import QuizContainer from "./QuizContainer";

interface QuizButtonProps {
  contentId: number;
  contentType: "movie" | "tv" | "series";
  contentTitle: string;
}

export default function QuizButton({
  contentId,
  contentType,
  contentTitle,
}: QuizButtonProps) {
  const [showQuiz, setShowQuiz] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowQuiz(true)}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 shadow-lg flex items-center gap-2"
      >
        <span className="text-xl">🎯</span>
        <span>Fai il Quiz</span>
      </button>

      {showQuiz && (
        <QuizContainer
          contentId={contentId}
          contentType={contentType}
          contentTitle={contentTitle}
          onClose={() => setShowQuiz(false)}
        />
      )}
    </>
  );
}

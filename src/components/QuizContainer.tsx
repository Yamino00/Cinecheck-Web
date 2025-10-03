"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import QuizStart from "./QuizStart";
import QuizQuestion from "./QuizQuestion";
import QuizResults from "./QuizResults";

export type QuizPhase = "idle" | "loading" | "playing" | "completed" | "error";

export interface QuizQuestion {
  id: string;
  question: string;
  answers: string[];
  difficulty: "easy" | "medium" | "hard";
  points: number;
}

export interface QuizAttempt {
  attemptId: string;
  questions: QuizQuestion[];
  totalPoints: number;
  passingScore: number;
}

export interface QuizResult {
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  performance: {
    easy: { correct: number; total: number };
    medium: { correct: number; total: number };
    hard: { correct: number; total: number };
  };
  answeredQuestions: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    difficulty: string;
    points: number;
  }>;
}

interface QuizContainerProps {
  contentId: number;
  contentType: "movie" | "tv";
  contentTitle: string;
  onClose: () => void;
}

export default function QuizContainer({
  contentId,
  contentType,
  contentTitle,
  onClose,
}: QuizContainerProps) {
  const { user, loading: authLoading } = useAuth();
  const [phase, setPhase] = useState<QuizPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30); // 30 secondi per domanda
  const [timerActive, setTimerActive] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || phase !== "playing") return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Tempo scaduto - passa alla prossima domanda con risposta vuota
          handleNextQuestion("");
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, phase, currentQuestionIndex]);

  // Avvia il quiz
  const startQuiz = async () => {
    // Verifica autenticazione
    if (!user) {
      setError("Devi effettuare il login per giocare ai quiz");
      setPhase("error");
      return;
    }

    setPhase("loading");
    setError(null);

    try {
      // Step 1: Genera/Recupera il quiz
      const generateResponse = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdb_id: contentId,
          content_type: contentType,
        }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || "Errore nella generazione del quiz");
      }

      const generateData = await generateResponse.json();

      console.log("📦 Generate Response:", generateData);

      // Gestisci struttura dati diversa (può essere generateData.content_id o generateData.quiz.content_id)
      const quiz_content_id =
        generateData.content_id || generateData.quiz?.content_id;

      if (!quiz_content_id) {
        console.error("❌ Content ID mancante. Dati ricevuti:", generateData);
        throw new Error("Content ID mancante nella risposta");
      }

      console.log("✅ Content ID trovato:", quiz_content_id);

      // Step 2: Avvia l'attempt
      const startResponse = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          content_id: quiz_content_id,
        }),
      });

      if (!startResponse.ok) {
        const errorData = await startResponse.json();
        throw new Error(errorData.error || "Errore nell'avvio del quiz");
      }

      const startData = await startResponse.json();

      console.log("🎮 Start Response:", startData);

      // La struttura è startData.quiz.questions, non startData.questions
      const questions = startData.quiz?.questions || startData.questions;
      const attemptId = startData.attempt_id;
      const totalPoints =
        startData.quiz?.total_points || startData.total_points;
      const passingScore =
        startData.quiz?.pass_threshold ||
        startData.quiz?.passing_score ||
        startData.passing_score;

      // Verifica che i dati siano validi
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        console.error("❌ Questions non valide:", { questions, startData });
        throw new Error("Dati quiz non validi ricevuti dal server");
      }

      console.log(
        "✅ Quiz caricato:",
        questions.length,
        "domande, threshold:",
        passingScore
      );

      setQuizData({
        attemptId,
        questions,
        totalPoints,
        passingScore,
      });

      setUserAnswers(new Array(questions.length).fill(""));
      setPhase("playing");
      setCurrentQuestionIndex(0);
      setTimeRemaining(30);
      setTimerActive(true);
    } catch (err) {
      console.error("Errore avvio quiz:", err);
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
      setPhase("error");
    }
  };

  // Gestisci risposta e passa alla prossima domanda
  const handleNextQuestion = (answer: string) => {
    if (!quizData) return;

    // Salva la risposta
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);

    // Se ci sono ancora domande, passa alla prossima
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeRemaining(30);
    } else {
      // Altrimenti, invia il quiz
      submitQuiz(newAnswers);
    }
  };

  // Invia il quiz
  const submitQuiz = async (answers: string[]) => {
    if (!quizData) return;

    setTimerActive(false);
    setPhase("loading");

    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attempt_id: quizData.attemptId,
          answers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Errore nell'invio del quiz");
      }

      const result = await response.json();
      console.log("🏁 Submit Response:", result);
      console.log("🔍 Result keys:", Object.keys(result));
      console.log("📋 Questions:", result.questions);
      console.log("📊 Performance:", result.performance);

      // Trasforma la risposta API nel formato QuizResult
      const quizResult: QuizResult = {
        score: result.score,
        totalPoints: result.max_score,
        percentage: result.percentage,
        passed: result.passed,
        correctAnswers: result.correct_answers,
        totalQuestions: result.total_questions,
        performance: result.performance,
        answeredQuestions: (result.questions || []).map((q: any) => ({
          question: q.question,
          userAnswer: q.user_answer,
          correctAnswer: q.correct_answer,
          isCorrect: q.is_correct,
          difficulty: q.difficulty,
          points: q.points,
        })),
      };

      console.log("✅ QuizResult trasformato:", quizResult);
      setQuizResult(quizResult);
      setPhase("completed");
    } catch (err) {
      console.error("Errore invio quiz:", err);
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
      setPhase("error");
    }
  };

  // Riprova il quiz
  const retryQuiz = () => {
    setPhase("idle");
    setError(null);
    setQuizData(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizResult(null);
    setTimeRemaining(30);
    setTimerActive(false);
  };

  // Render loading autenticazione
  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-white mb-2">
            Verifica autenticazione...
          </h3>
        </div>
      </div>
    );
  }

  // Render fase loading
  if (phase === "loading") {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-white mb-2">
            {phase === "loading" && currentQuestionIndex === 0
              ? "Generazione quiz in corso..."
              : "Elaborazione risultati..."}
          </h3>
          <p className="text-gray-400">
            {phase === "loading" && currentQuestionIndex === 0
              ? "Stiamo preparando le domande per te"
              : "Calcolo del punteggio"}
          </p>
        </div>
      </div>
    );
  }

  // Render fase error
  if (phase === "error") {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4 text-center">⚠️</div>
          <h3 className="text-xl font-bold text-white mb-2 text-center">
            Errore
          </h3>
          <p className="text-gray-400 text-center mb-6">{error}</p>
          <div className="flex gap-4">
            <button
              onClick={retryQuiz}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Riprova
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl my-8">
        {phase === "idle" && (
          <QuizStart
            contentTitle={contentTitle}
            onStart={startQuiz}
            onClose={onClose}
          />
        )}

        {phase === "playing" && quizData && (
          <QuizQuestion
            question={quizData.questions[currentQuestionIndex]}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={quizData.questions.length}
            timeRemaining={timeRemaining}
            onAnswer={handleNextQuestion}
            selectedAnswer={userAnswers[currentQuestionIndex]}
          />
        )}

        {phase === "completed" && quizResult && (
          <QuizResults
            result={quizResult}
            contentTitle={contentTitle}
            onRetry={retryQuiz}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

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
  isNewQuiz?: boolean; // Indica se è stato generato un nuovo quiz
  generationReason?: string; // Motivo della generazione
}

interface QuizContainerProps {
  contentId: number;
  contentType: "movie" | "tv" | "series";
  contentTitle: string;
  onClose: () => void;
  onComplete?: (passed: boolean) => void;
}

export default function QuizContainer({
  contentId,
  contentType,
  contentTitle,
  onClose,
  onComplete,
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
  const [quizMetadata, setQuizMetadata] = useState<{
    isReused: boolean;
    generationReason?: string;
  } | null>(null);

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
      // Normalizza il content_type per l'API (tv -> series)
      const apiContentType = contentType === "tv" ? "series" : contentType;

      // Step 1: Genera/Recupera il quiz (Sistema Intelligente)
      const generateResponse = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id, // NUOVO: necessario per il sistema intelligente
          tmdb_id: contentId,
          content_type: apiContentType,
        }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || "Errore nella generazione del quiz");
      }

      const generateData = await generateResponse.json();

      console.log("📦 Generate Response:", generateData);
      
      // Sistema intelligente: ottieni quiz_id e content_id
      const quiz_id = generateData.quiz_id; // NUOVO: ID del quiz specifico
      const quiz_content_id =
        generateData.content_id || generateData.quiz?.content_id;
        
      // Salva metadata del quiz per mostrare all'utente
      setQuizMetadata({
        isReused: generateData.reused || false,
        generationReason: generateData.generation_reason,
      });
      
      // Log se il quiz è stato riutilizzato o generato nuovo
      if (generateData.reused) {
        console.log("♻️ Quiz riutilizzato dal database (cached)");
      } else {
        console.log("🆕 Nuovo quiz generato con AI");
        if (generateData.generation_reason === 'all_quizzes_completed') {
          console.log("🎆 Motivo: L'utente ha completato tutti i quiz esistenti");
        } else if (generateData.generation_reason === 'no_quiz_exists') {
          console.log("🆕 Motivo: Primo quiz per questo contenuto");
        }
      }
      
      if (!quiz_id) {
        console.error("❌ Quiz ID mancante. Dati ricevuti:", generateData);
        throw new Error("Quiz ID mancante nella risposta");
      }

      if (!quiz_content_id) {
        console.error("❌ Content ID mancante. Dati ricevuti:", generateData);
        throw new Error("Content ID mancante nella risposta");
      }

      console.log("✅ Quiz ID:", quiz_id, "| Content ID:", quiz_content_id);

      // Step 2: Avvia l'attempt con quiz_id specifico
      const startResponse = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          quiz_id: quiz_id, // NUOVO: passa il quiz_id specifico
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
      // Costruisci l'array di risposte nel formato corretto
      const formattedAnswers = quizData.questions.map((question, index) => ({
        question_id: question.id,
        selected_answer: answers[index] || "", // Usa la risposta o stringa vuota se tempo scaduto
      }));

      console.log("📤 Invio risposte:", formattedAnswers);

      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attempt_id: quizData.attemptId,
          answers: formattedAnswers,
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
        isNewQuiz: quizMetadata?.isReused === false,
        generationReason: quizMetadata?.generationReason,
      };

      console.log("✅ QuizResult trasformato:", quizResult);
      console.log("🎯 Setting phase to completed...");
      setQuizResult(quizResult);
      setPhase("completed");
      console.log("✨ Phase set to completed, quizResult:", quizResult);

      // NON chiamare onComplete qui! Lo faremo quando l'utente chiude QuizResults
      // in modo che possa vedere i risultati prima
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
    setQuizMetadata(null); // Reset metadata
  };

  // Chiudi il quiz e notifica il parent
  const handleClose = () => {
    // Se c'è un risultato e il quiz è stato passato, notifica il parent
    if (quizResult && onComplete) {
      onComplete(quizResult.passed);
    }
    onClose();
  };

  // Log per debugging
  console.log("🔄 QuizContainer Render State:", {
    phase: phase,
    phaseType: typeof phase,
    phaseValue: JSON.stringify(phase),
    isCompleted: phase === "completed",
    hasQuizResult: !!quizResult,
    quizResult: quizResult
      ? {
          score: quizResult.score,
          passed: quizResult.passed,
          questionsCount: quizResult.answeredQuestions?.length,
        }
      : null,
  });

  // Render loading autenticazione
  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-netflix-dark-950 rounded-xl p-8 max-w-md w-full text-center border border-white/10 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-2">
            Verifica autenticazione...
          </h3>
          <p className="text-gray-400 mb-6">Attendere prego</p>

          {/* Quiz Loader Animation */}
          <div className="quiz-loader">
            <div className="circle-loader">
              <div className="circle-dot"></div>
              <div className="circle-outline"></div>
            </div>
            <div className="circle-loader">
              <div className="circle-dot"></div>
              <div className="circle-outline"></div>
            </div>
            <div className="circle-loader">
              <div className="circle-dot"></div>
              <div className="circle-outline"></div>
            </div>
            <div className="circle-loader">
              <div className="circle-dot"></div>
              <div className="circle-outline"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render fase loading
  if (phase === "loading") {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-netflix-dark-950 rounded-xl p-8 max-w-md w-full text-center border border-white/10 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-3">
            {currentQuestionIndex === 0
              ? quizMetadata?.isReused 
                ? "Caricamento quiz..."
                : "Generazione quiz in corso..."
              : "Elaborazione risultati..."}
          </h3>
          <p className="text-gray-400 mb-6">
            {currentQuestionIndex === 0
              ? quizMetadata?.isReused
                ? "Recupero quiz esistente dal database"
                : quizMetadata?.generationReason === 'all_quizzes_completed'
                  ? "Creazione di un nuovo quiz personalizzato per te"
                  : "Stiamo preparando le domande per te"
              : "Calcolo del punteggio"}
          </p>

          {/* Quiz Loader Animation */}
          <div className="quiz-loader">
            <div className="circle-loader">
              <div className="circle-dot"></div>
              <div className="circle-outline"></div>
            </div>
            <div className="circle-loader">
              <div className="circle-dot"></div>
              <div className="circle-outline"></div>
            </div>
            <div className="circle-loader">
              <div className="circle-dot"></div>
              <div className="circle-outline"></div>
            </div>
            <div className="circle-loader">
              <div className="circle-dot"></div>
              <div className="circle-outline"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render fase error
  if (phase === "error") {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-netflix-dark-950 rounded-xl p-8 max-w-md w-full border border-netflix-600/30 shadow-2xl">
          <div className="w-20 h-20 bg-netflix-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">⚠️</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 text-center">
            Errore
          </h3>
          <p className="text-gray-400 text-center mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={retryQuiz}
              className="flex-1 bg-netflix-600 hover:bg-netflix-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg"
            >
              Riprova
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition border border-white/10"
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

        {(() => {
          const shouldRenderResults = phase === "completed" && quizResult;
          console.log("🎲 Should Render QuizResults?", {
            phase,
            hasQuizResult: !!quizResult,
            shouldRender: shouldRenderResults,
            condition1: phase === "completed",
            condition2: !!quizResult,
          });

          if (shouldRenderResults) {
            return (
              <QuizResults
                result={quizResult}
                contentTitle={contentTitle}
                onRetry={retryQuiz}
                onClose={handleClose}
              />
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
}

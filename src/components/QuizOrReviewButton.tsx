"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Award, Edit3 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/Toast";
import QuizContainer from "./QuizContainer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface QuizOrReviewButtonProps {
  contentId: number;
  contentType: "movie" | "tv";
  contentTitle: string;
}

export default function QuizOrReviewButton({
  contentId,
  contentType,
  contentTitle,
}: QuizOrReviewButtonProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [hasPassedQuiz, setHasPassedQuiz] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkQuizStatus();
  }, [contentId, user]);

  const checkQuizStatus = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Ottieni il token di autenticazione
      const { data: { session } } = await supabase.auth.getSession();
      
      // Cerca content_id dal tmdb_id
      const contentResponse = await fetch(
        `/api/quiz/check-status?tmdb_id=${contentId}&type=${contentType}`,
        {
          headers: {
            'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
          },
        }
      );

      if (!contentResponse.ok) {
        setHasPassedQuiz(false);
        return;
      }

      const data = await contentResponse.json();
      setHasPassedQuiz(data.hasPassed);
      
      // Log per debugging
      console.log('🎯 Quiz Status:', {
        hasPassed: data.hasPassed,
        canRetryQuiz: data.canRetryQuiz,
        message: data.message
      });
    } catch (error) {
      console.error("Error checking quiz status:", error);
      setHasPassedQuiz(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizComplete = (passed: boolean) => {
    setShowQuiz(false);
    if (passed) {
      setHasPassedQuiz(true);
      toast.success(
        "Congratulazioni! Ora puoi lasciare una recensione verificata!"
      );
    }
  };

  const handleReviewClick = () => {
    if (!user) {
      toast.info("Effettua il login per lasciare una recensione");
      router.push("/auth");
      return;
    }

    // TODO: Implementare la pagina di recensione
    toast.info("Funzionalità recensioni in arrivo!");
  };

  const handleQuizClick = () => {
    if (!user) {
      toast.info("Effettua il login per fare il quiz");
      router.push("/auth");
      return;
    }

    setShowQuiz(true);
  };

  if (isLoading) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled
        className="flex items-center justify-center gap-3 px-8 py-4 bg-white/50 text-black/50 rounded-lg font-semibold text-lg transition-colors shadow-lg cursor-wait"
      >
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span>Caricamento...</span>
      </motion.button>
    );
  }

  if (hasPassedQuiz) {
    // Mostra pulsante recensione se ha passato il quiz
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleReviewClick}
        className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg font-semibold text-lg transition-all shadow-lg"
      >
        <Edit3 className="w-6 h-6" />
        <span>✍️ Scrivi Recensione</span>
        <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-xs font-medium">
          Verificata
        </span>
      </motion.button>
    );
  }

  // Mostra pulsante quiz se non ha ancora passato
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleQuizClick}
        className="flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-gray-200 text-black rounded-lg font-semibold text-lg transition-colors shadow-lg"
      >
        <Award className="w-6 h-6" />
        <span>Fai il Quiz</span>
      </motion.button>

      {showQuiz && (
        <QuizContainer
          contentId={contentId}
          contentType={contentType === "tv" ? "series" : contentType}
          contentTitle={contentTitle}
          onClose={() => setShowQuiz(false)}
          onComplete={handleQuizComplete}
        />
      )}
    </>
  );
}

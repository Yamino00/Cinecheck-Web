-- =====================================================
-- CINECHECK - FIX INTELLIGENT QUIZ SYSTEM
-- Migrazione per ripristinare la logica del quiz intelligente
-- Versione: 2025-10-20
-- =====================================================

-- Questa migrazione corregge la mancanza della tabella `user_quiz_completions`
-- e della funzione `get_available_quizzes_for_user` rimosse
-- dalla migrazione `005`.

-- 1. Ripristina la tabella per tracciare i quiz completati dagli utenti
-- Questa tabella è FONDAMENTALE per impedire agli utenti di rifare lo stesso quiz
CREATE TABLE IF NOT EXISTS public.user_quiz_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE NOT NULL,
    attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    time_taken INTEGER, -- secondi
    UNIQUE(user_id, quiz_id) -- Un utente non può completare lo stesso quiz due volte
);

-- Commenti per chiarezza
COMMENT ON TABLE public.user_quiz_completions IS 'Traccia quali utenti hanno completato quali quiz, per evitare ripetizioni.';

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_user_quiz_completions_user_id ON public.user_quiz_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_completions_quiz_id ON public.user_quiz_completions(quiz_id);

-- Abilita RLS
ALTER TABLE public.user_quiz_completions ENABLE ROW LEVEL SECURITY;

-- Policies RLS
CREATE POLICY "Users can view their own completions" ON public.user_quiz_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions" ON public.user_quiz_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Ripristina la funzione per trovare quiz disponibili per un utente
-- Questa funzione è chiamata dall'API /api/quiz/generate
CREATE OR REPLACE FUNCTION public.get_available_quizzes_for_user(p_user_id UUID, p_content_id UUID)
RETURNS SETOF public.quizzes AS $$
BEGIN
    RETURN QUERY
    SELECT q.*
    FROM public.quizzes q
    WHERE q.content_id = p_content_id
      AND q.is_active = TRUE
      AND NOT EXISTS (
          SELECT 1
          FROM public.user_quiz_completions uqc
          WHERE uqc.quiz_id = q.id
            AND uqc.user_id = p_user_id
      )
    ORDER BY q.completion_count DESC, q.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.get_available_quizzes_for_user(UUID, UUID) IS 'Restituisce i quiz attivi per un dato contenuto che un utente non ha ancora completato.';

-- Log di completamento
INSERT INTO public.quiz_generation_logs (
  tmdb_id, 
  content_type, 
  generation_reason, 
  success, 
  questions_generated,
  ai_model
) VALUES (
  0, 
  'movie', 
  'database_schema_fix_intelligent_quiz', 
  true, 
  0,
  'cinecheck_v2025.10.20'
);

-- ✅ MIGRAZIONE DI CORREZIONE COMPLETATA ✅

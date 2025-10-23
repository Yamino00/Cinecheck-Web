-- =====================================================
-- CINECHECK - COMPLETE INTELLIGENT QUIZ FUNCTIONS
-- Migrazione per completare le funzioni del sistema quiz intelligente
-- Versione: 2025-10-23
-- =====================================================

-- Questa migrazione aggiunge le 2 funzioni mancanti dalla migrazione 006:
-- 1. user_has_completed_all_quizzes() - Verifica se utente ha esaurito tutti i quiz
-- 2. update_quiz_statistics() - Aggiorna statistiche quiz dopo completamento

-- ========================================
-- 1. FUNZIONE: user_has_completed_all_quizzes
-- ========================================
-- Utilizzata da: /api/quiz/generate per determinare generation_reason
-- Logica: Confronta numero quiz totali vs quiz completati dall'utente
CREATE OR REPLACE FUNCTION public.user_has_completed_all_quizzes(p_user_id UUID, p_content_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    total_quizzes INTEGER;
    completed_quizzes INTEGER;
BEGIN
    -- Conta tutti i quiz attivi per questo contenuto
    SELECT COUNT(*) INTO total_quizzes
    FROM public.quizzes
    WHERE content_id = p_content_id
      AND is_active = TRUE;
    
    -- Conta quanti quiz l'utente ha completato per questo contenuto
    SELECT COUNT(*) INTO completed_quizzes
    FROM public.user_quiz_completions
    WHERE user_id = p_user_id
      AND content_id = p_content_id;
    
    -- Ritorna TRUE se ci sono quiz e l'utente li ha completati tutti
    RETURN (total_quizzes > 0 AND completed_quizzes >= total_quizzes);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.user_has_completed_all_quizzes(UUID, UUID) IS 
'Verifica se un utente ha completato tutti i quiz disponibili per un contenuto. Usato da /api/quiz/generate per determinare generation_reason (no_quiz_exists vs all_quizzes_completed).';

-- ========================================
-- 2. FUNZIONE: update_quiz_statistics
-- ========================================
-- Aggiorna le statistiche aggregate di un quiz dopo ogni completamento
-- Campi aggiornati: completion_count, average_score, last_used_at
CREATE OR REPLACE FUNCTION public.update_quiz_statistics(quiz_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.quizzes
    SET 
        completion_count = (
            SELECT COUNT(*) 
            FROM public.user_quiz_completions 
            WHERE quiz_id = quiz_uuid
        ),
        average_score = (
            SELECT COALESCE(AVG((score::FLOAT / max_score::FLOAT) * 100), 0)
            FROM public.user_quiz_completions 
            WHERE quiz_id = quiz_uuid
        ),
        last_used_at = (
            SELECT MAX(completed_at) 
            FROM public.user_quiz_completions 
            WHERE quiz_id = quiz_uuid
        )
    WHERE id = quiz_uuid;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_quiz_statistics(UUID) IS 
'Aggiorna le statistiche aggregate di un quiz (completion_count, average_score, last_used_at) basandosi sui dati in user_quiz_completions. Chiamata automaticamente dal trigger dopo ogni completamento.';

-- ========================================
-- 3. TRIGGER: Aggiornamento Automatico Statistiche Quiz
-- ========================================
-- Trigger function che chiama update_quiz_statistics()
CREATE OR REPLACE FUNCTION public.trigger_update_quiz_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Aggiorna le statistiche del quiz quando viene inserito/aggiornato/eliminato un completamento
    IF TG_OP = 'DELETE' THEN
        PERFORM public.update_quiz_statistics(OLD.quiz_id);
        RETURN OLD;
    ELSE
        PERFORM public.update_quiz_statistics(NEW.quiz_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Crea il trigger sulla tabella user_quiz_completions
DROP TRIGGER IF EXISTS trigger_update_quiz_stats ON public.user_quiz_completions;
CREATE TRIGGER trigger_update_quiz_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.user_quiz_completions
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_quiz_statistics();

COMMENT ON TRIGGER trigger_update_quiz_stats ON public.user_quiz_completions IS 
'Trigger che aggiorna automaticamente le statistiche di un quiz ogni volta che un utente completa, modifica o elimina un completamento.';

-- ========================================
-- 4. LOG DI COMPLETAMENTO MIGRAZIONE
-- ========================================
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
  'migration_007_complete_intelligent_quiz_functions', 
  true, 
  0,
  'database_migration_v2025.10.23'
);

-- ✅ MIGRAZIONE 007 COMPLETATA ✅
-- Funzioni aggiunte:
-- - user_has_completed_all_quizzes(user_id, content_id) -> BOOLEAN
-- - update_quiz_statistics(quiz_id) -> VOID
-- - trigger_update_quiz_statistics() -> TRIGGER FUNCTION
-- Trigger creato:
-- - trigger_update_quiz_stats su user_quiz_completions (AFTER INSERT/UPDATE/DELETE)

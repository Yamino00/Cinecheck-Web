-- 004_intelligent_quiz_system.sql
-- Migrazione per il sistema intelligente di gestione quiz

-- 1. Tabella Quizzes: raggruppa un set di domande in un'entità unica
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    description TEXT,
    created_by UUID REFERENCES profiles(id),
    generation_reason TEXT DEFAULT 'manual',
    is_ai_generated BOOLEAN DEFAULT FALSE,
    generation_metadata JSONB DEFAULT '{}'::JSONB,
    total_questions INTEGER DEFAULT 0,
    difficulty_distribution JSONB DEFAULT '{}'::JSONB,
    completion_count INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabella per tracciare i quiz completati dagli utenti
-- Questa tabella impedisce agli utenti di rifare lo stesso quiz
CREATE TABLE user_quiz_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE NOT NULL,
    attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    time_taken INTEGER, -- secondi
    UNIQUE(user_id, quiz_id) -- Un utente non può completare lo stesso quiz due volte
);

-- Indici per performance
CREATE INDEX idx_user_quiz_completions_user_id ON user_quiz_completions(user_id);
CREATE INDEX idx_user_quiz_completions_content_id ON user_quiz_completions(content_id);
CREATE INDEX idx_user_quiz_completions_quiz_id ON user_quiz_completions(quiz_id);
CREATE INDEX idx_user_quiz_completions_completed_at ON user_quiz_completions(completed_at DESC);

-- 2. Tabella per tracciare la generazione dei quiz
-- Utile per monitorare quando e perché sono stati generati quiz
CREATE TABLE quiz_generation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
    tmdb_id INTEGER NOT NULL,
    content_type content_type NOT NULL,
    generation_reason TEXT NOT NULL, -- 'no_quiz_exists', 'all_quizzes_completed', 'manual_generation'
    success BOOLEAN NOT NULL,
    error_message TEXT,
    generation_time INTEGER, -- millisecondi
    questions_generated INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_generation_logs_content_id ON quiz_generation_logs(content_id);
CREATE INDEX idx_quiz_generation_logs_tmdb_id ON quiz_generation_logs(tmdb_id);
CREATE INDEX idx_quiz_generation_logs_created_at ON quiz_generation_logs(created_at DESC);

-- 3. Aggiungi colonne utili alle tabelle per collegarle ai quiz
ALTER TABLE quiz_questions
ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES quizzes(id) ON DELETE SET NULL;

ALTER TABLE quiz_attempts
ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES quizzes(id) ON DELETE SET NULL;

-- Indici per le nuove colonne
CREATE INDEX idx_quizzes_content_id ON quizzes(content_id);
CREATE INDEX idx_quizzes_generation_reason ON quizzes(generation_reason);
CREATE INDEX idx_quizzes_is_ai_generated ON quizzes(is_ai_generated);
CREATE INDEX idx_quizzes_last_used_at ON quizzes(last_used_at DESC);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);

-- 4. Funzione per aggiornare le statistiche di un quiz
CREATE OR REPLACE FUNCTION update_quiz_statistics(quiz_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE quizzes 
    SET 
        total_questions = (
            SELECT COUNT(*) 
            FROM quiz_questions 
            WHERE quiz_id = quiz_uuid
        ),
        completion_count = (
            SELECT COUNT(*) 
            FROM user_quiz_completions 
            WHERE quiz_id = quiz_uuid
        ),
        average_score = (
            SELECT COALESCE(AVG(score::DECIMAL / NULLIF(max_score, 0) * 100), 0)
            FROM user_quiz_completions 
            WHERE quiz_id = quiz_uuid
        ),
        last_used_at = (
            SELECT MAX(completed_at)
            FROM user_quiz_completions 
            WHERE quiz_id = quiz_uuid
        )
    WHERE id = quiz_uuid;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger per aggiornare automaticamente le statistiche
CREATE OR REPLACE FUNCTION trigger_update_quiz_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Aggiorna le statistiche del quiz quando viene completato
    IF TG_OP = 'INSERT' THEN
        PERFORM update_quiz_statistics(NEW.quiz_id);
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM update_quiz_statistics(NEW.quiz_id);
        -- Se il quiz_id è cambiato, aggiorna anche il vecchio
        IF OLD.quiz_id != NEW.quiz_id THEN
            PERFORM update_quiz_statistics(OLD.quiz_id);
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_quiz_statistics(OLD.quiz_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quiz_stats_on_completion
    AFTER INSERT OR UPDATE OR DELETE ON user_quiz_completions
    FOR EACH ROW EXECUTE FUNCTION trigger_update_quiz_statistics();

-- 6. Funzione per ottenere quiz disponibili per un utente
-- Esclude i quiz già completati dall'utente
CREATE OR REPLACE FUNCTION get_available_quizzes_for_user(
    p_user_id UUID,
    p_content_id UUID,
    p_limit INTEGER DEFAULT 1
)
RETURNS TABLE (
    quiz_id UUID,
    title TEXT,
    description TEXT,
    total_questions INTEGER,
    difficulty_distribution JSONB,
    average_score DECIMAL(5,2),
    completion_count INTEGER,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        q.title,
        q.description,
        q.total_questions,
        q.difficulty_distribution,
        q.average_score,
        q.completion_count,
        q.created_at
    FROM quizzes q
    WHERE q.content_id = p_content_id
    AND q.id NOT IN (
        SELECT uqc.quiz_id 
        FROM user_quiz_completions uqc 
        WHERE uqc.user_id = p_user_id
    )
    ORDER BY 
        q.completion_count DESC, -- Quiz più popolari prima
        q.average_score DESC,    -- Quiz con score medio più alto
        q.created_at DESC        -- Quiz più recenti
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 7. Funzione per verificare se un utente ha completato tutti i quiz disponibili
CREATE OR REPLACE FUNCTION user_has_completed_all_quizzes(
    p_user_id UUID,
    p_content_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    total_quizzes INTEGER;
    completed_quizzes INTEGER;
BEGIN
    -- Conta tutti i quiz per il contenuto
    SELECT COUNT(*) INTO total_quizzes
    FROM quizzes 
    WHERE content_id = p_content_id;
    
    -- Conta i quiz completati dall'utente
    SELECT COUNT(*) INTO completed_quizzes
    FROM user_quiz_completions uqc
    JOIN quizzes q ON uqc.quiz_id = q.id
    WHERE uqc.user_id = p_user_id 
    AND q.content_id = p_content_id;
    
    -- Restituisce true se ha completato tutti i quiz disponibili
    RETURN total_quizzes > 0 AND completed_quizzes >= total_quizzes;
END;
$$ LANGUAGE plpgsql;

-- 8. Vista per statistiche quiz intelligenti
CREATE VIEW quiz_intelligence_stats AS
SELECT 
    c.id as content_id,
    c.title as content_title,
    c.type as content_type,
    COUNT(DISTINCT q.id) as total_quizzes,
    COUNT(DISTINCT uqc.user_id) as unique_completers,
    COUNT(uqc.id) as total_completions,
    AVG(uqc.score::DECIMAL / NULLIF(uqc.max_score, 0) * 100) as avg_completion_rate,
    MAX(uqc.completed_at) as last_completion,
    COUNT(CASE WHEN q.is_ai_generated THEN 1 END) as ai_generated_quizzes,
    COUNT(CASE WHEN q.generation_reason = 'no_quiz_exists' THEN 1 END) as auto_generated_quizzes
FROM contents c
LEFT JOIN quizzes q ON c.id = q.content_id
LEFT JOIN user_quiz_completions uqc ON q.id = uqc.quiz_id
GROUP BY c.id, c.title, c.type;

-- 9. Commenti per documentazione
COMMENT ON TABLE user_quiz_completions IS 'Traccia i quiz completati dagli utenti per prevenire duplicati';
COMMENT ON TABLE quiz_generation_logs IS 'Log delle generazioni di quiz per monitoraggio e debug';
COMMENT ON FUNCTION get_available_quizzes_for_user IS 'Restituisce quiz disponibili per un utente (esclude quelli già completati)';
COMMENT ON FUNCTION user_has_completed_all_quizzes IS 'Verifica se un utente ha completato tutti i quiz disponibili per un contenuto';
COMMENT ON VIEW quiz_intelligence_stats IS 'Statistiche aggregate per il sistema intelligente di quiz';

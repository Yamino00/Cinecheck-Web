-- 003_quiz_logic_schema.sql

-- 1. Tabella Quizzes: raggruppa un set di domande in un'entità unica
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    description TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_quizzes_content_id ON quizzes(content_id);

-- 2. Modifica Quiz Questions: aggiunta riferimento a un quiz specifico
-- Rimuove la necessità di un array JSONB in `quizzes` per le domande
ALTER TABLE quiz_questions
ADD COLUMN quiz_id UUID REFERENCES quizzes(id) ON DELETE SET NULL;
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- 3. Tabella User Quiz History: traccia i quiz completati dagli utenti
CREATE TABLE user_quiz_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
    attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    UNIQUE(user_id, quiz_id) -- Un utente non può fare lo stesso quiz due volte
);
CREATE INDEX idx_user_quiz_history_user_id ON user_quiz_history(user_id);
CREATE INDEX idx_user_quiz_history_quiz_id ON user_quiz_history(quiz_id);

-- 4. Modifica Quiz Attempts: aggiunta riferimento a `quizzes`
-- Rende più facile collegare un tentativo a un quiz strutturato
ALTER TABLE quiz_attempts
ADD COLUMN quiz_id UUID REFERENCES quizzes(id) ON DELETE SET NULL;
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);

COMMENT ON TABLE quizzes IS 'Raggruppa domande in un quiz specifico per un contenuto.';
COMMENT ON COLUMN quiz_questions.quiz_id IS 'Collega una domanda a un quiz specifico.';
COMMENT ON TABLE user_quiz_history IS 'Traccia quali quiz un utente ha già completato.';
COMMENT ON COLUMN quiz_attempts.quiz_id IS 'Collega un tentativo di quiz a un quiz strutturato.';

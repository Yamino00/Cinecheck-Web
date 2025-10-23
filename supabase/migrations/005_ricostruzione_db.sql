-- =====================================================
-- CINECHECK COMPLETE DATABASE SCHEMA
-- Migrazione unificata per sistema completo con rating classico
-- Versione: 2025-10-17
-- =====================================================

-- Rimuovi schema esistente e ricrea da zero
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Abilita estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Per full-text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- Per indici GIN performanti

-- =====================================================
-- TIPI PERSONALIZZATI
-- =====================================================

CREATE TYPE content_type AS ENUM ('movie', 'series', 'anime');
CREATE TYPE review_status AS ENUM ('draft', 'published', 'flagged', 'removed');
CREATE TYPE quiz_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE list_visibility AS ENUM ('public', 'private', 'friends');
CREATE TYPE notification_type AS ENUM ('follow', 'like', 'comment', 'review', 'achievement', 'system', 'quiz_completed');
CREATE TYPE activity_type AS ENUM ('review', 'follow', 'list_create', 'achievement', 'quiz_complete', 'watchlist_add');

-- =====================================================
-- TABELLE CORE
-- =====================================================

-- Tabella profili utenti (estende Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  location TEXT,
  website TEXT,
  -- Statistiche pubbliche
  reliability_score INTEGER DEFAULT 0 CHECK (reliability_score >= 0 AND reliability_score <= 100),
  total_reviews INTEGER DEFAULT 0,
  verified_reviews INTEGER DEFAULT 0,
  quiz_success_rate DECIMAL(5,2) DEFAULT 0,
  total_quiz_attempts INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  -- Gamification
  experience_points INTEGER DEFAULT 0,
  user_level INTEGER DEFAULT 1,
  achievements JSONB DEFAULT '[]'::JSONB,
  badges JSONB DEFAULT '[]'::JSONB,
  -- Preferenze e metadata
  preferences JSONB DEFAULT '{}'::JSONB,
  privacy_settings JSONB DEFAULT '{
    "profile_visibility": "public",
    "activity_visibility": "public",
    "watchlist_visibility": "public"
  }'::JSONB,
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella contenuti (cache TMDB)
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tmdb_id INTEGER UNIQUE NOT NULL,
  type content_type NOT NULL,
  title TEXT NOT NULL,
  original_title TEXT,
  overview TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  release_date DATE,
  runtime INTEGER,  -- minuti per film, null per serie
  -- Metadata TMDB
  genres JSONB DEFAULT '[]'::JSONB,
  cast_members JSONB DEFAULT '[]'::JSONB,  -- Array di {id, name, character, profile_path}
  crew JSONB DEFAULT '[]'::JSONB,          -- Array di {id, name, job, department}
  videos JSONB DEFAULT '[]'::JSONB,        -- Trailer e video
  keywords JSONB DEFAULT '[]'::JSONB,      -- Keywords per ricerca
  production_companies JSONB DEFAULT '[]'::JSONB,
  watch_providers JSONB DEFAULT '[]'::JSONB,
  -- Dati specifici per serie
  seasons JSONB,                           -- Solo per series/anime
  episodes_count INTEGER,                  -- Solo per series/anime
  networks JSONB DEFAULT '[]'::JSONB,      -- Solo per series/anime
  -- Metriche TMDB
  vote_average DECIMAL(3,1),
  vote_count INTEGER,
  popularity DECIMAL(10,3),
  -- Stato e sync
  status TEXT,  -- released, post_production, ended, etc.
  budget BIGINT,  -- Solo per film
  revenue BIGINT, -- Solo per film
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SISTEMA QUIZ INTELLIGENTE
-- =====================================================

-- Tabella quiz (raggruppa domande in entità)
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  description TEXT,
  -- Metadata generazione
  created_by UUID REFERENCES profiles(id), -- NULL se generato da AI
  generation_reason TEXT DEFAULT 'manual_creation',
  is_ai_generated BOOLEAN DEFAULT FALSE,
  generation_metadata JSONB DEFAULT '{}'::JSONB,
  -- Statistiche
  total_questions INTEGER DEFAULT 0,
  difficulty_distribution JSONB DEFAULT '{"easy": 0, "medium": 0, "hard": 0}'::JSONB,
  completion_count INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  pass_rate DECIMAL(5,2) DEFAULT 0,
  quality_score DECIMAL(5,2) DEFAULT 0,  -- Calcolato da feedback
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella domande quiz
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE NOT NULL,
  -- Contenuto domanda
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answers TEXT[] NOT NULL CHECK (array_length(wrong_answers, 1) = 3),
  -- Metadata
  difficulty quiz_difficulty NOT NULL,
  category TEXT, -- plot, cast, trivia, quotes, production, music
  time_limit INTEGER DEFAULT 30, -- secondi
  points INTEGER DEFAULT 10,
  hint TEXT,
  explanation TEXT,
  -- Statistiche di utilizzo
  times_answered INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  quality_score DECIMAL(5,2) DEFAULT 0,
  -- Generazione AI
  generated_by TEXT, -- gemini-2.0-flash, manual, etc.
  generation_prompt TEXT,
  tmdb_data JSONB, -- Dati TMDB usati per generazione
  validation_status TEXT DEFAULT 'validated' CHECK (validation_status IN ('pending', 'validated', 'rejected')),
  -- Timestamp
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella tentativi quiz
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE NOT NULL,
  -- Domande e risposte
  questions JSONB NOT NULL, -- Array di {question_id, user_answer, correct_answer, is_correct, time_taken, points_earned}
  -- Risultati
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN max_score > 0 THEN (score::DECIMAL / max_score * 100) ELSE 0 END
  ) STORED,
  time_taken INTEGER, -- secondi totali
  passed BOOLEAN NOT NULL,
  attempt_number INTEGER DEFAULT 1,
  -- Metadata
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SISTEMA RECENSIONI (RATING CLASSICO)
-- =====================================================

-- Tabella recensioni principali
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE NOT NULL,
  quiz_attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE SET NULL,
  
  -- Rating principale (classico 1-10)
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0.5 AND rating <= 10),
  
  -- Contenuto recensione
  title TEXT CHECK (LENGTH(title) <= 200),
  body TEXT NOT NULL CHECK (LENGTH(body) >= 20 AND LENGTH(body) <= 10000),
  
  -- Status e metadata
  status review_status DEFAULT 'published',
  is_verified BOOLEAN DEFAULT FALSE,
  quiz_score INTEGER, -- Punteggio quiz se verificata
  spoiler_warning BOOLEAN DEFAULT FALSE,
  
  -- Metadata aggiuntive
  liked_aspects TEXT[] DEFAULT '{}', -- Array di aspetti positivi
  disliked_aspects TEXT[] DEFAULT '{}', -- Array di aspetti negativi
  tags TEXT[] DEFAULT '{}', -- Tag personalizzati
  recommended BOOLEAN, -- Raccomanda o no
  rewatch_value INTEGER CHECK (rewatch_value >= 1 AND rewatch_value <= 5),
  emotional_impact INTEGER CHECK (emotional_impact >= 1 AND emotional_impact <= 5),
  watch_context TEXT, -- cinema, streaming, blu-ray, etc.
  
  -- Contatori engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint unico per utente/contenuto
  UNIQUE(user_id, content_id)
);

-- Tabella reazioni alle recensioni
CREATE TABLE review_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'helpful', 'insightful', 'funny', 'agree', 'disagree')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id, reaction_type)
);

-- Tabella commenti recensioni
CREATE TABLE review_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES review_comments(id) ON DELETE CASCADE, -- Per thread
  body TEXT NOT NULL CHECK (LENGTH(body) >= 5 AND LENGTH(body) <= 2000),
  likes_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella likes commenti
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES review_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- =====================================================
-- SISTEMA SOCIALE
-- =====================================================

-- Tabella follows
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Tabella notifiche
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}'::JSONB, -- Dati specifici per tipo notifica
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SISTEMA LISTE E WATCHLIST
-- =====================================================

-- Tabella liste utente
CREATE TABLE user_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  visibility list_visibility DEFAULT 'public',
  -- Tipi speciali
  is_default BOOLEAN DEFAULT FALSE,
  is_watchlist BOOLEAN DEFAULT FALSE,
  -- Statistiche
  items_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella elementi liste
CREATE TABLE list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID REFERENCES user_lists(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE NOT NULL,
  position INTEGER, -- Posizione nella lista
  notes TEXT, -- Note personali sull'elemento
  priority INTEGER DEFAULT 0, -- Per watchlist
  reminder_date DATE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, content_id)
);

-- Tabella followers delle liste
CREATE TABLE list_followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  list_id UUID REFERENCES user_lists(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, list_id)
);

-- Watchlist dedicata (ottimizzata per performance)
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'to_watch' CHECK (status IN ('to_watch', 'watching', 'watched')),
  priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 5),
  reminder_date DATE,
  notes TEXT,
  progress INTEGER DEFAULT 0, -- Per serie TV, episodi visti
  added_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- =====================================================
-- SISTEMA ATTIVITA' E FEED
-- =====================================================

-- Tabella attività per feed
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type activity_type NOT NULL,
  data JSONB NOT NULL, -- Dati specifici dell'attività
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SISTEMA ACHIEVEMENTS E GAMIFICATION
-- =====================================================

-- Tabella definizione achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  category TEXT,
  points INTEGER DEFAULT 10,
  criteria JSONB NOT NULL, -- Criteri per sbloccare
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella achievements utenti
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- =====================================================
-- TABELLE STATISTICHE E ANALYTICS
-- =====================================================

-- Statistiche contenuti aggregate
CREATE TABLE content_stats (
  content_id UUID PRIMARY KEY REFERENCES contents(id) ON DELETE CASCADE,
  -- Recensioni
  total_reviews INTEGER DEFAULT 0,
  verified_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  rating_distribution JSONB DEFAULT '{}'::JSONB, -- {1: count, 2: count, ...}
  -- Engagement
  total_likes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  -- Watchlist
  watchlist_count INTEGER DEFAULT 0,
  watched_count INTEGER DEFAULT 0,
  -- Quiz
  quiz_attempts INTEGER DEFAULT 0,
  quiz_pass_rate DECIMAL(5,2) DEFAULT 0,
  -- Timestamp
  last_review_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log generazione quiz (per monitoring)
CREATE TABLE quiz_generation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES contents(id) ON DELETE SET NULL,
  tmdb_id INTEGER NOT NULL,
  content_type content_type NOT NULL,
  generation_reason TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  generation_time INTEGER, -- millisecondi
  questions_generated INTEGER DEFAULT 0,
  ai_model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDICI PER PERFORMANCE
-- =====================================================

-- Indici profiles
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_reliability_score ON profiles(reliability_score DESC);
CREATE INDEX idx_profiles_total_reviews ON profiles(total_reviews DESC);
CREATE INDEX idx_profiles_last_active ON profiles(last_active_at DESC);

-- Indici contents
CREATE INDEX idx_contents_tmdb_id ON contents(tmdb_id);
CREATE INDEX idx_contents_type ON contents(type);
CREATE INDEX idx_contents_title ON contents USING GIN(title gin_trgm_ops);
CREATE INDEX idx_contents_genres ON contents USING GIN(genres);
CREATE INDEX idx_contents_release_date ON contents(release_date DESC) WHERE release_date IS NOT NULL;
CREATE INDEX idx_contents_popularity ON contents(popularity DESC NULLS LAST);
CREATE INDEX idx_contents_vote_average ON contents(vote_average DESC NULLS LAST);

-- Indici quiz system
CREATE INDEX idx_quizzes_content_id ON quizzes(content_id);
CREATE INDEX idx_quizzes_active ON quizzes(is_active, completion_count DESC);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_content_id ON quiz_questions(content_id);
CREATE INDEX idx_quiz_questions_difficulty ON quiz_questions(difficulty);
CREATE INDEX idx_quiz_attempts_user_content ON quiz_attempts(user_id, content_id);
CREATE INDEX idx_quiz_attempts_completed_at ON quiz_attempts(completed_at DESC) WHERE completed_at IS NOT NULL;

-- Indici recensioni
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_content_id ON reviews(content_id);
CREATE INDEX idx_reviews_status_created ON reviews(status, created_at DESC);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX idx_reviews_verified ON reviews(is_verified, created_at DESC);
CREATE INDEX idx_reviews_text_search ON reviews USING GIN(to_tsvector('italian', title || ' ' || body));
CREATE INDEX idx_reviews_tags ON reviews USING GIN(tags);

-- Indici reazioni e commenti
CREATE INDEX idx_review_reactions_review_id ON review_reactions(review_id);
CREATE INDEX idx_review_reactions_user_id ON review_reactions(user_id);
CREATE INDEX idx_review_comments_review_id ON review_comments(review_id, created_at);
CREATE INDEX idx_review_comments_user_id ON review_comments(user_id);

-- Indici social
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read, created_at DESC);

-- Indici liste e watchlist
CREATE INDEX idx_user_lists_user_visibility ON user_lists(user_id, visibility);
CREATE INDEX idx_list_items_list_position ON list_items(list_id, position NULLS LAST);
CREATE INDEX idx_watchlist_user_status ON watchlist(user_id, status);
CREATE INDEX idx_watchlist_user_priority ON watchlist(user_id, priority DESC);

-- Indici attività e feed
CREATE INDEX idx_activities_user_created ON activities(user_id, created_at DESC);
CREATE INDEX idx_activities_type_created ON activities(type, created_at DESC);
CREATE INDEX idx_activities_visibility ON activities(visibility, created_at DESC);

-- Indici achievements
CREATE INDEX idx_user_achievements_user_completed ON user_achievements(user_id, completed, unlocked_at DESC);

-- Indici statistiche
CREATE INDEX idx_content_stats_average_rating ON content_stats(average_rating DESC);
CREATE INDEX idx_content_stats_total_reviews ON content_stats(total_reviews DESC);

-- =====================================================
-- VIEWS OTTIMIZZATE
-- =====================================================

-- Vista feed recensioni con dati completi
CREATE VIEW review_feed AS
SELECT 
  r.id,
  r.user_id,
  r.content_id,
  r.rating,
  r.title,
  r.body,
  r.is_verified,
  r.spoiler_warning,
  r.tags,
  r.recommended,
  r.likes_count,
  r.comments_count,
  r.helpful_count,
  r.views_count,
  r.created_at,
  r.updated_at,
  -- User data
  p.username,
  p.display_name,
  p.avatar_url,
  p.reliability_score,
  p.user_level,
  -- Content data
  c.title AS content_title,
  c.poster_path,
  c.type AS content_type,
  c.release_date,
  c.vote_average AS tmdb_rating
FROM reviews r
JOIN profiles p ON r.user_id = p.id
JOIN contents c ON r.content_id = c.id
WHERE r.status = 'published';

-- Vista statistiche utenti
CREATE VIEW user_stats AS
SELECT 
  p.id,
  p.username,
  p.display_name,
  p.reliability_score,
  p.total_reviews,
  p.verified_reviews,
  p.quiz_success_rate,
  p.followers_count,
  p.following_count,
  p.experience_points,
  p.user_level,
  -- Calcoli derivati
  CASE 
    WHEN p.total_reviews > 0 THEN ROUND((p.verified_reviews::DECIMAL / p.total_reviews * 100), 1)
    ELSE 0 
  END as verified_percentage,
  -- Statistiche aggiuntive
  COALESCE(watchlist_stats.total_watchlist, 0) as total_watchlist,
  COALESCE(quiz_stats.total_quiz_attempts, 0) as total_quiz_attempts,
  COALESCE(social_stats.total_likes_received, 0) as total_likes_received
FROM profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) as total_watchlist
  FROM watchlist
  GROUP BY user_id
) watchlist_stats ON p.id = watchlist_stats.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as total_quiz_attempts
  FROM quiz_attempts
  GROUP BY user_id
) quiz_stats ON p.id = quiz_stats.user_id
LEFT JOIN (
  SELECT r.user_id, SUM(r.likes_count) as total_likes_received
  FROM reviews r
  WHERE r.status = 'published'
  GROUP BY r.user_id
) social_stats ON p.id = social_stats.user_id;

-- Vista contenuti con statistiche
CREATE VIEW content_overview AS
SELECT 
  c.*,
  COALESCE(cs.total_reviews, 0) as total_reviews,
  COALESCE(cs.verified_reviews, 0) as verified_reviews,
  COALESCE(cs.average_rating, 0) as cinecheck_rating,
  COALESCE(cs.watchlist_count, 0) as watchlist_count,
  COALESCE(cs.quiz_pass_rate, 0) as quiz_pass_rate,
  -- Quiz availability
  CASE 
    WHEN EXISTS (SELECT 1 FROM quizzes q WHERE q.content_id = c.id AND q.is_active = TRUE)
    THEN TRUE ELSE FALSE 
  END as has_quiz
FROM contents c
LEFT JOIN content_stats cs ON c.id = cs.content_id;

-- =====================================================
-- FUNZIONI STORED PROCEDURES
-- =====================================================

-- Funzione per aggiornare statistiche contenuto
CREATE OR REPLACE FUNCTION update_content_stats(p_content_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO content_stats (
    content_id,
    total_reviews,
    verified_reviews,
    average_rating,
    rating_distribution,
    total_likes,
    total_comments,
    total_views,
    watchlist_count,
    watched_count,
    quiz_attempts,
    quiz_pass_rate,
    last_review_at
  )
  SELECT 
    p_content_id,
    -- Reviews stats
    COUNT(r.id) as total_reviews,
    COUNT(r.id) FILTER (WHERE r.is_verified = TRUE) as verified_reviews,
    ROUND(AVG(r.rating), 2) as average_rating,
    jsonb_object_agg(
      FLOOR(r.rating)::text, 
      COUNT(*)
    ) FILTER (WHERE r.rating IS NOT NULL) as rating_distribution,
    SUM(r.likes_count) as total_likes,
    SUM(r.comments_count) as total_comments,
    SUM(r.views_count) as total_views,
    MAX(r.created_at) as last_review_at,
    -- Watchlist stats
    (SELECT COUNT(*) FROM watchlist w WHERE w.content_id = p_content_id) as watchlist_count,
    (SELECT COUNT(*) FROM watchlist w WHERE w.content_id = p_content_id AND w.status = 'watched') as watched_count,
    -- Quiz stats
    (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.content_id = p_content_id) as quiz_attempts,
    (
      SELECT CASE 
        WHEN COUNT(*) > 0 THEN ROUND(COUNT(*) FILTER (WHERE passed = TRUE)::DECIMAL / COUNT(*) * 100, 2)
        ELSE 0 
      END
      FROM quiz_attempts qa WHERE qa.content_id = p_content_id
    ) as quiz_pass_rate
  FROM reviews r
  WHERE r.content_id = p_content_id AND r.status = 'published'
  ON CONFLICT (content_id) 
  DO UPDATE SET
    total_reviews = EXCLUDED.total_reviews,
    verified_reviews = EXCLUDED.verified_reviews,
    average_rating = EXCLUDED.average_rating,
    rating_distribution = EXCLUDED.rating_distribution,
    total_likes = EXCLUDED.total_likes,
    total_comments = EXCLUDED.total_comments,
    total_views = EXCLUDED.total_views,
    watchlist_count = EXCLUDED.watchlist_count,
    watched_count = EXCLUDED.watched_count,
    quiz_attempts = EXCLUDED.quiz_attempts,
    quiz_pass_rate = EXCLUDED.quiz_pass_rate,
    last_review_at = EXCLUDED.last_review_at,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Funzione per aggiornare contatori utente
CREATE OR REPLACE FUNCTION update_user_stats(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  review_count INTEGER;
  verified_count INTEGER;
  quiz_success DECIMAL;
  quiz_total INTEGER;
BEGIN
  -- Conta recensioni
  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_verified = TRUE)
  INTO review_count, verified_count
  FROM reviews 
  WHERE user_id = p_user_id AND status = 'published';
  
  -- Calcola quiz success rate
  SELECT COUNT(*), COUNT(*) FILTER (WHERE passed = TRUE)
  INTO quiz_total, quiz_success
  FROM quiz_attempts
  WHERE user_id = p_user_id;
  
  -- Aggiorna profilo
  UPDATE profiles SET
    total_reviews = review_count,
    verified_reviews = verified_count,
    total_quiz_attempts = quiz_total,
    quiz_success_rate = CASE 
      WHEN quiz_total > 0 THEN ROUND(quiz_success / quiz_total * 100, 2)
      ELSE 0 
    END,
    reliability_score = CASE
      WHEN review_count > 0 THEN LEAST(100, GREATEST(0,
        (verified_count::DECIMAL / review_count * 40) +
        (CASE WHEN quiz_total > 0 THEN quiz_success / quiz_total * 30 ELSE 0 END) +
        (LEAST(review_count, 10) * 3) -- Bonus per numero recensioni (max 30pts)
      ))
      ELSE 0
    END::INTEGER,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Funzione per ricerca avanzata recensioni
CREATE OR REPLACE FUNCTION search_reviews(
  p_query TEXT DEFAULT NULL,
  p_content_type content_type DEFAULT NULL,
  p_min_rating DECIMAL DEFAULT NULL,
  p_max_rating DECIMAL DEFAULT NULL,
  p_verified_only BOOLEAN DEFAULT FALSE,
  p_tags TEXT[] DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_content_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  review_id UUID,
  user_id UUID,
  content_id UUID,
  rating DECIMAL,
  title TEXT,
  body TEXT,
  is_verified BOOLEAN,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  reliability_score INTEGER,
  content_title TEXT,
  content_type content_type,
  poster_path TEXT,
  likes_count INTEGER,
  helpful_count INTEGER,
  comments_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    r.content_id,
    r.rating,
    r.title,
    r.body,
    r.is_verified,
    r.tags,
    r.created_at,
    p.username,
    p.display_name,
    p.avatar_url,
    p.reliability_score,
    c.title,
    c.type,
    c.poster_path,
    r.likes_count,
    r.helpful_count,
    r.comments_count
  FROM reviews r
  JOIN profiles p ON r.user_id = p.id
  JOIN contents c ON r.content_id = c.id
  WHERE r.status = 'published'
    AND (p_query IS NULL OR (
      r.title ILIKE '%' || p_query || '%' OR 
      r.body ILIKE '%' || p_query || '%' OR
      c.title ILIKE '%' || p_query || '%'
    ))
    AND (p_content_type IS NULL OR c.type = p_content_type)
    AND (p_min_rating IS NULL OR r.rating >= p_min_rating)
    AND (p_max_rating IS NULL OR r.rating <= p_max_rating)
    AND (NOT p_verified_only OR r.is_verified = TRUE)
    AND (p_tags IS NULL OR r.tags && p_tags)
    AND (p_user_id IS NULL OR r.user_id = p_user_id)
    AND (p_content_id IS NULL OR r.content_id = p_content_id)
  ORDER BY r.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS AUTOMATICI
-- =====================================================

-- Trigger per updated_at automatico
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applica trigger alle tabelle necessarie
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON quiz_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_lists_updated_at BEFORE UPDATE ON user_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watchlist_updated_at BEFORE UPDATE ON watchlist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger per aggiornamento statistiche quando cambiano recensioni
CREATE OR REPLACE FUNCTION trigger_update_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_content_stats(NEW.content_id);
    PERFORM update_user_stats(NEW.user_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM update_content_stats(OLD.content_id);
    PERFORM update_user_stats(OLD.user_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION trigger_update_stats();

-- Trigger per contatori reazioni
CREATE OR REPLACE FUNCTION update_review_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
    UPDATE reviews SET
      likes_count = (
        SELECT COUNT(*) FROM review_reactions 
        WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
        AND reaction_type = 'like'
      ),
      helpful_count = (
        SELECT COUNT(*) FROM review_reactions 
        WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
        AND reaction_type = 'helpful'
      )
    WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reaction_counts
  AFTER INSERT OR DELETE ON review_reactions
  FOR EACH ROW EXECUTE FUNCTION update_review_reaction_counts();

-- Trigger per contatori commenti
CREATE OR REPLACE FUNCTION update_review_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
    UPDATE reviews SET
      comments_count = (
        SELECT COUNT(*) FROM review_comments 
        WHERE review_id = COALESCE(NEW.review_id, OLD.review_id)
      )
    WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_counts
  AFTER INSERT OR DELETE ON review_comments
  FOR EACH ROW EXECUTE FUNCTION update_review_comment_counts();

-- Trigger per contatori follow
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementa following per follower
    UPDATE profiles SET following_count = following_count + 1
    WHERE id = NEW.follower_id;
    -- Incrementa followers per following
    UPDATE profiles SET followers_count = followers_count + 1
    WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementa following per follower
    UPDATE profiles SET following_count = GREATEST(0, following_count - 1)
    WHERE id = OLD.follower_id;
    -- Decrementa followers per following
    UPDATE profiles SET followers_count = GREATEST(0, followers_count - 1)
    WHERE id = OLD.following_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_follow_counts_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- =====================================================
-- RLS POLICIES (ROW LEVEL SECURITY)
-- =====================================================

-- Abilita RLS su tutte le tabelle
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_generation_logs ENABLE ROW LEVEL SECURITY;

-- Policies per profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies per contents (pubblici)
CREATE POLICY "Contents are viewable by everyone" ON contents
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage contents" ON contents
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Policies per quiz system
CREATE POLICY "Quizzes are viewable by everyone" ON quizzes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Quiz questions are viewable by everyone" ON quiz_questions
  FOR SELECT USING (validation_status = 'validated');

CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies per reviews
CREATE POLICY "Published reviews are viewable by everyone" ON reviews
  FOR SELECT USING (status = 'published' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Policies per reazioni
CREATE POLICY "Review reactions are viewable by everyone" ON review_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reactions" ON review_reactions
  FOR ALL USING (auth.uid() = user_id);

-- Policies per commenti
CREATE POLICY "Comments are viewable by everyone" ON review_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own comments" ON review_comments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own comment likes" ON comment_likes
  FOR ALL USING (auth.uid() = user_id);

-- Policies per follow
CREATE POLICY "Follows are viewable by everyone" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own follows" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Policies per notifiche
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies per liste
CREATE POLICY "Public lists are viewable by everyone" ON user_lists
  FOR SELECT USING (visibility = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own lists" ON user_lists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "List items follow list visibility" ON list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_lists ul 
      WHERE ul.id = list_id 
      AND (ul.visibility = 'public' OR ul.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage their own list items" ON list_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_lists ul 
      WHERE ul.id = list_id 
      AND ul.user_id = auth.uid()
    )
  );

-- Policies per watchlist
CREATE POLICY "Users can manage their own watchlist" ON watchlist
  FOR ALL USING (auth.uid() = user_id);

-- Policies per attività
CREATE POLICY "Public activities are viewable by relevant users" ON activities
  FOR SELECT USING (
    visibility = 'public' OR 
    auth.uid() = user_id OR
    (visibility = 'followers' AND EXISTS (
      SELECT 1 FROM follows f 
      WHERE f.follower_id = auth.uid() 
      AND f.following_id = activities.user_id
    ))
  );

CREATE POLICY "Users can create their own activities" ON activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies per achievements
CREATE POLICY "Achievements are viewable by everyone" ON achievements
  FOR SELECT USING (is_active = true);

CREATE POLICY "User achievements are viewable by everyone" ON user_achievements
  FOR SELECT USING (true);

-- Policies per statistiche (read-only per utenti)
CREATE POLICY "Content stats are viewable by everyone" ON content_stats
  FOR SELECT USING (true);

-- =====================================================
-- DATI INIZIALI (ACHIEVEMENTS PREDEFINITI)
-- =====================================================

INSERT INTO achievements (code, name, description, icon, category, points, criteria, rarity) VALUES
('first_review', 'Prima Recensione', 'Hai scritto la tua prima recensione!', '⭐', 'reviews', 10, '{"total_reviews": 1}', 'common'),
('verified_expert', 'Esperto Verificato', 'Hai scritto 10 recensioni verificate!', '✅', 'reviews', 50, '{"verified_reviews": 10}', 'rare'),
('prolific_reviewer', 'Recensore Prolifico', 'Hai scritto 100 recensioni!', '📝', 'reviews', 100, '{"total_reviews": 100}', 'epic'),
('quiz_master', 'Maestro dei Quiz', 'Hai superato 25 quiz!', '🧠', 'quiz', 75, '{"quiz_passed": 25}', 'rare'),
('perfect_score', 'Punteggio Perfetto', 'Hai ottenuto il punteggio massimo in un quiz!', '🎯', 'quiz', 25, '{"perfect_quiz": 1}', 'rare'),
('social_butterfly', 'Farfalla Sociale', 'Hai 50 follower!', '🦋', 'social', 50, '{"followers": 50}', 'rare'),
('movie_buff', 'Cinefilo', 'Hai recensito 50 film!', '🎬', 'content', 75, '{"movie_reviews": 50}', 'rare'),
('series_addict', 'Dipendente da Serie', 'Hai recensito 25 serie TV!', '📺', 'content', 75, '{"series_reviews": 25}', 'rare'),
('helpful_critic', 'Critico Utile', 'Le tue recensioni hanno ricevuto 100 "utili"!', '👍', 'engagement', 100, '{"helpful_votes": 100}', 'epic'),
('early_adopter', 'Pioniere', 'Sei uno dei primi 1000 utenti di Cinecheck!', '🚀', 'special', 200, '{"user_id_range": 1000}', 'legendary');

-- =====================================================
-- COMMENTI E DOCUMENTAZIONE
-- =====================================================

COMMENT ON SCHEMA public IS 'Cinecheck - Schema completo per piattaforma recensioni cinematografiche';
COMMENT ON TABLE profiles IS 'Profili utenti estesi con gamification e statistiche';
COMMENT ON TABLE contents IS 'Cache contenuti TMDB (film, serie, anime)';
COMMENT ON TABLE quizzes IS 'Quiz intelligenti generati da AI per verificare conoscenza';
COMMENT ON TABLE quiz_questions IS 'Domande quiz con difficoltà e statistiche utilizzo';
COMMENT ON TABLE quiz_attempts IS 'Tentativi quiz degli utenti con risultati dettagliati';
COMMENT ON TABLE reviews IS 'Recensioni utenti con rating classico 1-10';
COMMENT ON TABLE review_reactions IS 'Reazioni alle recensioni (like, helpful, etc.)';
COMMENT ON TABLE review_comments IS 'Commenti alle recensioni con thread';
COMMENT ON TABLE follows IS 'Sistema di follow tra utenti';
COMMENT ON TABLE notifications IS 'Notifiche utenti per attività rilevanti';
COMMENT ON TABLE user_lists IS 'Liste personalizzate create dagli utenti';
COMMENT ON TABLE watchlist IS 'Watchlist ottimizzata per performance';
COMMENT ON TABLE activities IS 'Feed attività utenti per timeline social';
COMMENT ON TABLE achievements IS 'Sistema achievements per gamification';
COMMENT ON TABLE content_stats IS 'Statistiche aggregate per contenuti';

-- =====================================================
-- FINE MIGRAZIONE
-- =====================================================

-- Verifica creazione schema
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Log completamento
INSERT INTO quiz_generation_logs (
  tmdb_id, 
  content_type, 
  generation_reason, 
  success, 
  questions_generated,
  ai_model
) VALUES (
  0, 
  'movie', 
  'database_schema_created', 
  true, 
  0,
  'cinecheck_v2025.10.17'
);

-- ✅ MIGRAZIONE COMPLETATA SUCCESSFULLY ✅
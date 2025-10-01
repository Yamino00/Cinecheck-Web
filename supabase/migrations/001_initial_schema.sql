-- Inserite in Supabase 
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE content_type AS ENUM ('movie', 'series', 'anime');
CREATE TYPE review_status AS ENUM ('draft', 'published', 'flagged', 'removed');
CREATE TYPE quiz_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE list_visibility AS ENUM ('public', 'private', 'friends');
CREATE TYPE notification_type AS ENUM ('follow', 'like', 'comment', 'review', 'achievement', 'system');

-- Users profiles table (extends Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    location TEXT,
    website TEXT,
    reliability_score INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    verified_reviews INTEGER DEFAULT 0,
    quiz_success_rate DECIMAL(5,2) DEFAULT 0,
    achievements JSONB DEFAULT '[]'::JSONB,
    preferences JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contents table (movies, series, anime cached from TMDB)
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
    runtime INTEGER,
    genres JSONB DEFAULT '[]'::JSONB,
    cast_members JSONB DEFAULT '[]'::JSONB,
    crew JSONB DEFAULT '[]'::JSONB,
    videos JSONB DEFAULT '[]'::JSONB,
    vote_average DECIMAL(3,1),
    vote_count INTEGER,
    popularity DECIMAL(10,3),
    seasons JSONB, -- For series/anime
    episodes_count INTEGER, -- For series/anime
    status TEXT,
    budget BIGINT,
    revenue BIGINT,
    production_companies JSONB DEFAULT '[]'::JSONB,
    keywords JSONB DEFAULT '[]'::JSONB,
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz questions table
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    wrong_answers TEXT[] NOT NULL,
    difficulty quiz_difficulty NOT NULL,
    category TEXT, -- plot, cast, trivia, quotes, production
    time_limit INTEGER DEFAULT 30, -- seconds
    points INTEGER DEFAULT 10,
    hint TEXT,
    explanation TEXT,
    times_answered INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz attempts table (tracks user quiz performance)
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
    questions JSONB NOT NULL, -- Array of question IDs and user answers
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    time_taken INTEGER, -- seconds
    passed BOOLEAN NOT NULL,
    attempt_number INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
    quiz_attempt_id UUID REFERENCES quiz_attempts(id),
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 10),
    title TEXT,
    body TEXT NOT NULL,
    status review_status DEFAULT 'published',
    is_verified BOOLEAN DEFAULT FALSE,
    quiz_score INTEGER,
    spoiler_warning BOOLEAN DEFAULT FALSE,
    liked_aspects TEXT[],
    disliked_aspects TEXT[],
    recommended BOOLEAN,
    rewatch_value INTEGER CHECK (rewatch_value >= 1 AND rewatch_value <= 5),
    emotional_impact INTEGER CHECK (emotional_impact >= 1 AND emotional_impact <= 5),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, content_id)
);

-- User follows table
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Review likes table
CREATE TABLE review_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, review_id)
);

-- Review comments table
CREATE TABLE review_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES review_comments(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comment likes table
CREATE TABLE comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES review_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);

-- User lists table
CREATE TABLE user_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    visibility list_visibility DEFAULT 'public',
    is_default BOOLEAN DEFAULT FALSE,
    is_watchlist BOOLEAN DEFAULT FALSE,
    is_watched BOOLEAN DEFAULT FALSE,
    items_count INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- List items table
CREATE TABLE list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID REFERENCES user_lists(id) ON DELETE CASCADE,
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
    position INTEGER,
    notes TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(list_id, content_id)
);

-- List followers table
CREATE TABLE list_followers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    list_id UUID REFERENCES user_lists(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, list_id)
);

-- Watchlist (special list) table
CREATE TABLE watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0,
    reminder_date DATE,
    notes TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, content_id)
);

-- Watch history table
CREATE TABLE watch_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
    watched_at TIMESTAMPTZ DEFAULT NOW(),
    season INTEGER, -- For series
    episode INTEGER, -- For series
    progress INTEGER, -- Minutes watched
    completed BOOLEAN DEFAULT FALSE
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}'::JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievement definitions table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    category TEXT,
    points INTEGER DEFAULT 10,
    criteria JSONB NOT NULL,
    rarity TEXT, -- common, rare, epic, legendary
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements table
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMPTZ,
    UNIQUE(user_id, achievement_id)
);

-- Activity feed table
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- review, follow, list_create, achievement, etc
    data JSONB NOT NULL,
    visibility TEXT DEFAULT 'public',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content recommendations table
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
    reason TEXT,
    score DECIMAL(5,2),
    engaged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, content_id)
);

-- Create indexes for performance
CREATE INDEX idx_contents_tmdb_id ON contents(tmdb_id);
CREATE INDEX idx_contents_type ON contents(type);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_content_id ON reviews(content_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_quiz_questions_content_id ON quiz_questions(content_id);
CREATE INDEX idx_quiz_attempts_user_content ON quiz_attempts(user_id, content_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_watch_history_user ON watch_history(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_created ON activities(created_at DESC);

-- Create views for common queries
CREATE VIEW review_feed AS
SELECT 
    r.*,
    p.username,
    p.display_name,
    p.avatar_url,
    p.reliability_score,
    c.title AS content_title,
    c.poster_path,
    c.type AS content_type
FROM reviews r
JOIN profiles p ON r.user_id = p.id
JOIN contents c ON r.content_id = c.id
WHERE r.status = 'published';

-- Create view for user stats
CREATE VIEW user_stats AS
SELECT 
    p.id,
    p.username,
    COUNT(DISTINCT r.id) AS total_reviews,
    COUNT(DISTINCT r.id) FILTER (WHERE r.is_verified) AS verified_reviews,
    AVG(r.rating) AS avg_rating,
    COUNT(DISTINCT wh.content_id) AS watched_count,
    COUNT(DISTINCT f1.following_id) AS following_count,
    COUNT(DISTINCT f2.follower_id) AS followers_count
FROM profiles p
LEFT JOIN reviews r ON p.id = r.user_id
LEFT JOIN watch_history wh ON p.id = wh.user_id
LEFT JOIN follows f1 ON p.id = f1.follower_id
LEFT JOIN follows f2 ON p.id = f2.following_id
GROUP BY p.id, p.username;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON quiz_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_lists_updated_at BEFORE UPDATE ON user_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_comments_updated_at BEFORE UPDATE ON review_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update review counts
CREATE OR REPLACE FUNCTION update_review_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE reviews SET likes_count = likes_count + 1 WHERE id = NEW.review_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE reviews SET likes_count = likes_count - 1 WHERE id = OLD.review_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_review_likes_count
AFTER INSERT OR DELETE ON review_likes
FOR EACH ROW EXECUTE FUNCTION update_review_counts();

-- Function to update user reliability score
CREATE OR REPLACE FUNCTION update_reliability_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles 
    SET 
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE user_id = NEW.user_id),
        verified_reviews = (SELECT COUNT(*) FROM reviews WHERE user_id = NEW.user_id AND is_verified = TRUE),
        reliability_score = CASE 
            WHEN (SELECT COUNT(*) FROM reviews WHERE user_id = NEW.user_id) > 0 
            THEN ((SELECT COUNT(*) FROM reviews WHERE user_id = NEW.user_id AND is_verified = TRUE)::FLOAT / 
                  (SELECT COUNT(*) FROM reviews WHERE user_id = NEW.user_id)::FLOAT * 100)::INTEGER
            ELSE 0
        END
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_reliability
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_reliability_score();
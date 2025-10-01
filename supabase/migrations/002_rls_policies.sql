-- Inserita in Supabase
-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Contents policies (public read)
CREATE POLICY "Contents are viewable by everyone" ON contents
    FOR SELECT USING (true);

CREATE POLICY "Only admins can insert contents" ON contents
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update contents" ON contents
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Quiz questions policies
CREATE POLICY "Quiz questions are viewable by everyone" ON quiz_questions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create quiz questions" ON quiz_questions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own quiz questions" ON quiz_questions
    FOR UPDATE USING (auth.uid() = created_by);

-- Quiz attempts policies
CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Published reviews are viewable by everyone" ON reviews
    FOR SELECT USING (status = 'published' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone" ON follows
    FOR SELECT USING (true);

CREATE POLICY "Users can create follows" ON follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" ON follows
    FOR DELETE USING (auth.uid() = follower_id);

-- Review likes policies
CREATE POLICY "Review likes are viewable by everyone" ON review_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like reviews" ON review_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike reviews" ON review_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Review comments policies
CREATE POLICY "Comments are viewable by everyone" ON review_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON review_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON review_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON review_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Comment likes policies
CREATE POLICY "Comment likes are viewable by everyone" ON comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like comments" ON comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments" ON comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- User lists policies
CREATE POLICY "Public lists are viewable by everyone" ON user_lists
    FOR SELECT USING (visibility = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own lists" ON user_lists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists" ON user_lists
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists" ON user_lists
    FOR DELETE USING (auth.uid() = user_id);

-- List items policies
CREATE POLICY "List items follow list visibility" ON list_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_lists 
            WHERE user_lists.id = list_items.list_id 
            AND (user_lists.visibility = 'public' OR user_lists.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can add items to their lists" ON list_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_lists 
            WHERE user_lists.id = list_id 
            AND user_lists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update items in their lists" ON list_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_lists 
            WHERE user_lists.id = list_id 
            AND user_lists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete items from their lists" ON list_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_lists 
            WHERE user_lists.id = list_id 
            AND user_lists.user_id = auth.uid()
        )
    );

-- List followers policies
CREATE POLICY "List followers are viewable" ON list_followers
    FOR SELECT USING (true);

CREATE POLICY "Users can follow lists" ON list_followers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow lists" ON list_followers
    FOR DELETE USING (auth.uid() = user_id);

-- Watchlist policies
CREATE POLICY "Users can view their own watchlist" ON watchlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their watchlist" ON watchlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their watchlist" ON watchlist
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their watchlist" ON watchlist
    FOR DELETE USING (auth.uid() = user_id);

-- Watch history policies
CREATE POLICY "Users can view their own watch history" ON watch_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their watch history" ON watch_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their watch history" ON watch_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Achievements are viewable by everyone" ON achievements
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage achievements" ON achievements
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- User achievements policies
CREATE POLICY "User achievements are viewable by everyone" ON user_achievements
    FOR SELECT USING (true);

CREATE POLICY "System can manage user achievements" ON user_achievements
    FOR ALL USING (true);

-- Activities policies
CREATE POLICY "Public activities are viewable by everyone" ON activities
    FOR SELECT USING (
        visibility = 'public' OR 
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM follows 
            WHERE follows.follower_id = auth.uid() 
            AND follows.following_id = activities.user_id
        )
    );

CREATE POLICY "Users can create their own activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recommendations policies
CREATE POLICY "Users can view their own recommendations" ON recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage recommendations" ON recommendations
    FOR ALL USING (true);
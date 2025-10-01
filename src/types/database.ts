export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          bio: string | null
          avatar_url: string | null
          banner_url: string | null
          location: string | null
          website: string | null
          reliability_score: number
          total_reviews: number
          verified_reviews: number
          quiz_success_rate: number
          achievements: Json
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name: string
          bio?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          location?: string | null
          website?: string | null
          reliability_score?: number
          total_reviews?: number
          verified_reviews?: number
          quiz_success_rate?: number
          achievements?: Json
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          bio?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          location?: string | null
          website?: string | null
          reliability_score?: number
          total_reviews?: number
          verified_reviews?: number
          quiz_success_rate?: number
          achievements?: Json
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      contents: {
        Row: {
          id: string
          tmdb_id: number
          type: 'movie' | 'series' | 'anime'
          title: string
          original_title: string | null
          overview: string | null
          poster_path: string | null
          backdrop_path: string | null
          release_date: string | null
          runtime: number | null
          genres: Json
          cast_members: Json
          crew: Json
          videos: Json
          vote_average: number | null
          vote_count: number | null
          popularity: number | null
          seasons: Json | null
          episodes_count: number | null
          status: string | null
          budget: number | null
          revenue: number | null
          production_companies: Json
          keywords: Json
          last_sync_at: string
          created_at: string
        }
        Insert: {
          id?: string
          tmdb_id: number
          type: 'movie' | 'series' | 'anime'
          title: string
          original_title?: string | null
          overview?: string | null
          poster_path?: string | null
          backdrop_path?: string | null
          release_date?: string | null
          runtime?: number | null
          genres?: Json
          cast_members?: Json
          crew?: Json
          videos?: Json
          vote_average?: number | null
          vote_count?: number | null
          popularity?: number | null
          seasons?: Json | null
          episodes_count?: number | null
          status?: string | null
          budget?: number | null
          revenue?: number | null
          production_companies?: Json
          keywords?: Json
          last_sync_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          tmdb_id?: number
          type?: 'movie' | 'series' | 'anime'
          title?: string
          original_title?: string | null
          overview?: string | null
          poster_path?: string | null
          backdrop_path?: string | null
          release_date?: string | null
          runtime?: number | null
          genres?: Json
          cast_members?: Json
          crew?: Json
          videos?: Json
          vote_average?: number | null
          vote_count?: number | null
          popularity?: number | null
          seasons?: Json | null
          episodes_count?: number | null
          status?: string | null
          budget?: number | null
          revenue?: number | null
          production_companies?: Json
          keywords?: Json
          last_sync_at?: string
          created_at?: string
        }
      }
      quiz_questions: {
        Row: {
          id: string
          content_id: string
          question: string
          correct_answer: string
          wrong_answers: string[]
          difficulty: 'easy' | 'medium' | 'hard'
          category: string
          time_limit: number
          points: number
          hint: string | null
          explanation: string | null
          times_answered: number
          times_correct: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_id: string
          question: string
          correct_answer: string
          wrong_answers: string[]
          difficulty: 'easy' | 'medium' | 'hard'
          category: string
          time_limit?: number
          points?: number
          hint?: string | null
          explanation?: string | null
          times_answered?: number
          times_correct?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content_id?: string
          question?: string
          correct_answer?: string
          wrong_answers?: string[]
          difficulty?: 'easy' | 'medium' | 'hard'
          category?: string
          time_limit?: number
          points?: number
          hint?: string | null
          explanation?: string | null
          times_answered?: number
          times_correct?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          content_id: string
          questions: Json
          score: number
          max_score: number
          time_taken: number | null
          passed: boolean
          attempt_number: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          questions: Json
          score: number
          max_score: number
          time_taken?: number | null
          passed: boolean
          attempt_number?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          questions?: Json
          score?: number
          max_score?: number
          time_taken?: number | null
          passed?: boolean
          attempt_number?: number
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          content_id: string
          quiz_attempt_id: string | null
          rating: number
          title: string | null
          body: string
          status: 'draft' | 'published' | 'flagged' | 'removed'
          is_verified: boolean
          quiz_score: number | null
          spoiler_warning: boolean
          liked_aspects: string[] | null
          disliked_aspects: string[] | null
          recommended: boolean | null
          rewatch_value: number | null
          emotional_impact: number | null
          likes_count: number
          comments_count: number
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          quiz_attempt_id?: string | null
          rating: number
          title?: string | null
          body: string
          status?: 'draft' | 'published' | 'flagged' | 'removed'
          is_verified?: boolean
          quiz_score?: number | null
          spoiler_warning?: boolean
          liked_aspects?: string[] | null
          disliked_aspects?: string[] | null
          recommended?: boolean | null
          rewatch_value?: number | null
          emotional_impact?: number | null
          likes_count?: number
          comments_count?: number
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          quiz_attempt_id?: string | null
          rating?: number
          title?: string | null
          body?: string
          status?: 'draft' | 'published' | 'flagged' | 'removed'
          is_verified?: boolean
          quiz_score?: number | null
          spoiler_warning?: boolean
          liked_aspects?: string[] | null
          disliked_aspects?: string[] | null
          recommended?: boolean | null
          rewatch_value?: number | null
          emotional_impact?: number | null
          likes_count?: number
          comments_count?: number
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'follow' | 'like' | 'comment' | 'review' | 'achievement' | 'system'
          title: string
          body: string | null
          data: Json
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'follow' | 'like' | 'comment' | 'review' | 'achievement' | 'system'
          title: string
          body?: string | null
          data?: Json
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'follow' | 'like' | 'comment' | 'review' | 'achievement' | 'system'
          title?: string
          body?: string | null
          data?: Json
          read?: boolean
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          type: string
          data: Json
          visibility: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          data: Json
          visibility?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          data?: Json
          visibility?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
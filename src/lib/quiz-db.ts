/**
 * Quiz Database Helper Functions
 * 
 * Funzioni per interagire con Supabase per il sistema quiz
 */

import { createClient } from '@supabase/supabase-js';
import type { QuizQuestion, GeminiQuizResponse } from './gemini';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase con Service Role Key (bypassa RLS - solo per backend)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

/**
 * Interfacce Database
 */
export interface DBQuizQuestion {
    id: string;
    content_id: string;
    question: string;
    correct_answer: string;
    wrong_answers: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    time_limit: number;
    points: number;
    hint?: string;
    explanation: string;
    times_answered: number;
    times_correct: number;
    generated_by: string;
    generation_prompt?: string;
    tmdb_data?: any;
    validation_status: string;
    quality_score?: number;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface DBQuizAttempt {
    id: string;
    user_id: string;
    content_id: string;
    questions: any; // JSONB con array di question IDs
    score: number;
    max_score: number;
    time_taken?: number;
    passed: boolean;
    attempt_number: number;
    created_at: string;
}

export interface DBContent {
    id: string;
    tmdb_id: number;
    type: 'movie' | 'series' | 'anime';
    title: string;
    original_title?: string;
    overview?: string;
    poster_path?: string;
    backdrop_path?: string;
    release_date?: string;
    runtime?: number;
    genres?: any;
    cast_members?: any;
    crew?: any;
    vote_average?: number;
    created_at: string;
}

/**
 * Verifica se esiste un quiz per un contenuto
 */
export async function getQuizByContentId(contentId: string): Promise<DBQuizQuestion[] | null> {
    try {
        const { data, error } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('content_id', contentId)
            .eq('validation_status', 'validated')
            .order('difficulty', { ascending: true });

        if (error) throw error;

        return data && data.length > 0 ? data : null;
    } catch (error: any) {
        console.error('❌ Errore recupero quiz:', error.message);
        return null;
    }
}

/**
 * Verifica se esiste un quiz per TMDB ID (senza content_id ancora)
 */
export async function getQuizByTmdbId(tmdbId: number, contentType: 'movie' | 'series'): Promise<DBQuizQuestion[] | null> {
    try {
        // Prima trova il content
        const { data: content, error: contentError } = await supabase
            .from('contents')
            .select('id')
            .eq('tmdb_id', tmdbId)
            .eq('type', contentType)
            .single();

        if (contentError || !content) return null;

        // Poi recupera il quiz
        return getQuizByContentId(content.id);
    } catch (error: any) {
        console.error('❌ Errore recupero quiz by TMDB ID:', error.message);
        return null;
    }
}

/**
 * Salva domande quiz generate da Gemini
 */
export async function saveQuizQuestions(
    contentId: string,
    quizResponse: GeminiQuizResponse,
    generationPrompt: string,
    tmdbData: any
): Promise<DBQuizQuestion[]> {
    try {
        const questionsToInsert = quizResponse.questions.map(q => ({
            content_id: contentId,
            question: q.question,
            correct_answer: q.correct_answer,
            wrong_answers: q.wrong_answers,
            difficulty: q.difficulty,
            category: q.category,
            time_limit: q.time_limit,
            points: q.points,
            hint: q.hint,
            explanation: q.explanation,
            times_answered: 0,
            times_correct: 0,
            generated_by: 'gemini-2.5-flash',
            generation_prompt: generationPrompt,
            tmdb_data: tmdbData,
            validation_status: 'validated', // Auto-validato per ora
            quality_score: 0,
        }));

        const { data, error } = await supabase
            .from('quiz_questions')
            .insert(questionsToInsert)
            .select();

        if (error) throw error;

        console.log(`✅ Salvate ${data.length} domande quiz per content ${contentId}`);
        return data;
    } catch (error: any) {
        console.error('❌ Errore salvataggio quiz:', error.message);
        throw error;
    }
}

/**
 * Crea o recupera un contenuto da TMDB ID
 */
export async function getOrCreateContent(
    tmdbId: number,
    contentType: 'movie' | 'series',
    tmdbData: any
): Promise<string> {
    try {
        // Cerca se esiste già
        const { data: existing, error: searchError } = await supabase
            .from('contents')
            .select('id')
            .eq('tmdb_id', tmdbId)
            .eq('type', contentType)
            .single();

        if (existing && !searchError) {
            console.log(`✅ Content già esistente: ${existing.id}`);
            return existing.id;
        }

        // Altrimenti crea nuovo
        const contentToInsert = {
            tmdb_id: tmdbId,
            type: contentType,
            title: tmdbData.title || tmdbData.name,
            original_title: tmdbData.original_title || tmdbData.original_name,
            overview: tmdbData.overview,
            poster_path: tmdbData.poster_path,
            backdrop_path: tmdbData.backdrop_path,
            release_date: tmdbData.release_date || tmdbData.first_air_date,
            runtime: tmdbData.runtime || tmdbData.number_of_episodes,
            genres: tmdbData.genres,
            cast_members: tmdbData.cast?.slice(0, 10),
            crew: tmdbData.crew?.slice(0, 5),
            vote_average: tmdbData.vote_average,
        };

        const { data, error } = await supabase
            .from('contents')
            .insert(contentToInsert)
            .select('id')
            .single();

        if (error) throw error;

        console.log(`✅ Nuovo content creato: ${data.id}`);
        return data.id;
    } catch (error: any) {
        console.error('❌ Errore creazione content:', error.message);
        throw error;
    }
}

/**
 * Crea un nuovo tentativo quiz
 */
export async function createQuizAttempt(
    userId: string,
    contentId: string,
    questionIds: string[]
): Promise<string> {
    try {
        // Conta tentativi precedenti
        const { count } = await supabase
            .from('quiz_attempts')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('content_id', contentId);

        const attemptNumber = (count || 0) + 1;

        // Calcola max score
        const { data: questions } = await supabase
            .from('quiz_questions')
            .select('points')
            .in('id', questionIds);

        const maxScore = questions?.reduce((sum, q) => sum + q.points, 0) || 0;

        const { data, error } = await supabase
            .from('quiz_attempts')
            .insert({
                user_id: userId,
                content_id: contentId,
                questions: { question_ids: questionIds },
                score: 0,
                max_score: maxScore,
                passed: false,
                attempt_number: attemptNumber,
            })
            .select('id')
            .single();

        if (error) throw error;

        console.log(`✅ Tentativo quiz creato: ${data.id}`);
        return data.id;
    } catch (error: any) {
        console.error('❌ Errore creazione tentativo:', error.message);
        throw error;
    }
}

/**
 * Aggiorna risultato tentativo quiz
 */
export async function updateQuizAttempt(
    attemptId: string,
    score: number,
    maxScore: number,
    timeTaken: number,
    passed: boolean
): Promise<void> {
    try {
        const { error } = await supabase
            .from('quiz_attempts')
            .update({
                score,
                max_score: maxScore,
                time_taken: timeTaken,
                passed,
            })
            .eq('id', attemptId);

        if (error) throw error;

        console.log(`✅ Tentativo aggiornato: ${attemptId} - Score: ${score}/${maxScore}`);
    } catch (error: any) {
        console.error('❌ Errore aggiornamento tentativo:', error.message);
        throw error;
    }
}

/**
 * Aggiorna statistiche domanda (times_answered, times_correct, quality_score)
 */
export async function updateQuestionStatistics(
    questionId: string,
    wasCorrect: boolean
): Promise<void> {
    try {
        // Recupera statistiche attuali
        const { data: question, error: fetchError } = await supabase
            .from('quiz_questions')
            .select('times_answered, times_correct')
            .eq('id', questionId)
            .single();

        if (fetchError || !question) throw fetchError;

        const newTimesAnswered = question.times_answered + 1;
        const newTimesCorrect = question.times_correct + (wasCorrect ? 1 : 0);

        // Calcola quality score (importato da gemini.ts)
        const correctRate = newTimesCorrect / newTimesAnswered;
        let qualityScore = 0;

        if (correctRate >= 0.6 && correctRate <= 0.8) {
            qualityScore = 1.0;
        } else if (correctRate >= 0.4 && correctRate < 0.6) {
            qualityScore = 0.8;
        } else if (correctRate > 0.8 && correctRate <= 0.9) {
            qualityScore = 0.7;
        } else if (correctRate >= 0.3 && correctRate < 0.4) {
            qualityScore = 0.6;
        } else {
            qualityScore = 0.3;
        }

        const { error: updateError } = await supabase
            .from('quiz_questions')
            .update({
                times_answered: newTimesAnswered,
                times_correct: newTimesCorrect,
                quality_score: qualityScore,
            })
            .eq('id', questionId);

        if (updateError) throw updateError;
    } catch (error: any) {
        console.error('❌ Errore aggiornamento statistiche:', error.message);
    }
}

/**
 * Verifica se l'utente ha passato il quiz per un contenuto
 */
export async function hasUserPassedQuiz(
    userId: string,
    contentId: string
): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('quiz_attempts')
            .select('passed')
            .eq('user_id', userId)
            .eq('content_id', contentId)
            .eq('passed', true)
            .limit(1);

        if (error) throw error;

        return data && data.length > 0;
    } catch (error: any) {
        console.error('❌ Errore verifica quiz passato:', error.message);
        return false;
    }
}

/**
 * Log tentativo generazione (per debug)
 */
export async function logGenerationAttempt(
    tmdbId: number,
    contentType: string,
    success: boolean,
    errorMessage?: string,
    generationTime?: number,
    questionsGenerated?: number
): Promise<void> {
    try {
        // Trova content_id se esiste
        const { data: content } = await supabase
            .from('contents')
            .select('id')
            .eq('tmdb_id', tmdbId)
            .eq('type', contentType)
            .single();

        await supabase
            .from('quiz_generation_logs')
            .insert({
                content_id: content?.id,
                tmdb_id: tmdbId,
                content_type: contentType,
                success,
                error_message: errorMessage,
                generation_time: generationTime,
                questions_generated: questionsGenerated || 0,
            });
    } catch (error: any) {
        console.error('❌ Errore log generazione:', error.message);
    }
}

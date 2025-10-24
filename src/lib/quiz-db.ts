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

// Debug: verifica che la Service Role Key sia caricata
if (!supabaseServiceKey || supabaseServiceKey === 'undefined') {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY non trovata! Usando anon key come fallback.');
    console.error('Valore ricevuto:', supabaseServiceKey);
}

// Client Supabase con Service Role Key (bypassa RLS - solo per backend)
const supabase = createClient(
    supabaseUrl,
    supabaseServiceKey || supabaseAnonKey, // Fallback a anon key se service key manca
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

console.log('🔑 quiz-db.ts - Client inizializzato con chiave:',
    supabaseServiceKey ? 'SERVICE_ROLE ✅' : 'ANON (fallback) ⚠️'
);

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
 * Crea o recupera un contenuto da TMDB ID
 */
export async function getOrCreateContent(
    tmdbId: number,
    contentType: 'movie' | 'series',
    tmdbData: any
): Promise<string> {
    console.log('🔍 getOrCreateContent - Tentativo di recupero/creazione content:', tmdbId, contentType);

    try {
        // Usa la funzione SECURITY DEFINER che bypassa RLS in modo sicuro
        const { data, error } = await supabase.rpc('get_or_create_content', {
            p_tmdb_id: tmdbId,
            p_type: contentType,
            p_title: tmdbData.title || tmdbData.name,
            p_original_title: tmdbData.original_title || tmdbData.original_name,
            p_overview: tmdbData.overview,
            p_poster_path: tmdbData.poster_path,
            p_backdrop_path: tmdbData.backdrop_path,
            p_release_date: tmdbData.release_date || tmdbData.first_air_date,
            p_runtime: tmdbData.runtime || tmdbData.number_of_episodes,
            p_genres: tmdbData.genres || null,
            p_cast_members: tmdbData.cast?.slice(0, 10) || null,
            p_crew: tmdbData.crew?.slice(0, 5) || null,
            p_vote_average: tmdbData.vote_average || null
        });

        if (error) {
            console.error('❌ Errore chiamata funzione get_or_create_content:', error);
            throw error;
        }

        console.log(`✅ Content recuperato/creato: ${data}`);
        return data;
    } catch (error: any) {
        console.error('❌ Errore creazione content:', error.message);
        console.error('Stack trace completo:', error);
        throw error;
    }
}/**
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
    questionsGenerated?: number,
    generationReason?: string
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
                generation_reason: generationReason || 'manual_generation',
                success,
                error_message: errorMessage,
                generation_time: generationTime,
                questions_generated: questionsGenerated || 0,
            });
    } catch (error: any) {
        console.error('❌ Errore log generazione:', error.message);
    }
}

/**
 * ====== SISTEMA INTELLIGENTE DI GESTIONE QUIZ ======
 */

/**
 * Interfaccia per un Quiz completo (entity)
 */
export interface DBQuiz {
    id: string;
    content_id: string;
    title: string;
    description?: string;
    created_by?: string;
    generation_reason: string;
    is_ai_generated: boolean;
    generation_metadata?: any;
    total_questions: number;
    difficulty_distribution?: any;
    completion_count: number;
    average_score: number;
    last_used_at?: string;
    created_at: string;
}

/**
 * Trova quiz disponibili per un utente (che non ha ancora completato)
 * Usa la funzione SQL get_available_quizzes_for_user
 */
export async function getAvailableQuizzesForUser(
    userId: string,
    contentId: string
): Promise<DBQuiz[]> {
    try {
        const { data, error } = await supabase
            .rpc('get_available_quizzes_for_user', {
                p_user_id: userId,
                p_content_id: contentId
            });

        if (error) {
            console.error('❌ Errore get_available_quizzes_for_user:', error);
            throw error;
        }

        return data || [];
    } catch (error: any) {
        console.error('❌ Errore recupero quiz disponibili:', error.message);
        return [];
    }
}

/**
 * Verifica se l'utente ha completato tutti i quiz disponibili
 * Usa la funzione SQL user_has_completed_all_quizzes
 */
export async function userHasCompletedAllQuizzes(
    userId: string,
    contentId: string
): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .rpc('user_has_completed_all_quizzes', {
                p_user_id: userId,
                p_content_id: contentId
            });

        if (error) throw error;
        return data === true;
    } catch (error: any) {
        console.error('❌ Errore verifica quiz completati:', error.message);
        return false;
    }
}

/**
 * Crea una nuova entity Quiz
 */
export async function createQuiz(
    contentId: string,
    title: string,
    description: string,
    generationReason: string,
    isAiGenerated: boolean,
    generationMetadata?: any,
    createdBy?: string
): Promise<string> {
    try {
        const { data, error } = await supabase
            .from('quizzes')
            .insert({
                content_id: contentId,
                title,
                description,
                generation_reason: generationReason,
                is_ai_generated: isAiGenerated,
                generation_metadata: generationMetadata || {},
                created_by: createdBy,
                total_questions: 0,
                difficulty_distribution: {},
                completion_count: 0,
                average_score: 0
            })
            .select('id')
            .single();

        if (error) throw error;

        console.log(`✅ Quiz entity creato: ${data.id}`);
        return data.id;
    } catch (error: any) {
        console.error('❌ Errore creazione quiz:', error.message);
        throw error;
    }
}

/**
 * Salva domande quiz collegate a un quiz_id specifico
 */
export async function saveQuizQuestionsWithQuizId(
    quizId: string,
    contentId: string,
    quizResponse: GeminiQuizResponse,
    generationPrompt: string,
    tmdbData: any
): Promise<DBQuizQuestion[]> {
    try {
        const questionsToInsert = quizResponse.questions.map(q => ({
            quiz_id: quizId, // Collegamento al quiz
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
            generated_by: 'gemini-2.0-flash',
            generation_prompt: generationPrompt,
            tmdb_data: tmdbData,
            validation_status: 'validated',
            quality_score: 0,
        }));

        const { data, error } = await supabase
            .from('quiz_questions')
            .insert(questionsToInsert)
            .select();

        if (error) throw error;

        // Aggiorna total_questions nel quiz
        await updateQuizQuestionsCount(quizId, data.length);

        // Aggiorna difficulty_distribution
        const distribution = {
            easy: data.filter(q => q.difficulty === 'easy').length,
            medium: data.filter(q => q.difficulty === 'medium').length,
            hard: data.filter(q => q.difficulty === 'hard').length,
        };
        await updateQuizDifficultyDistribution(quizId, distribution);

        console.log(`✅ Salvate ${data.length} domande per quiz ${quizId}`);
        return data;
    } catch (error: any) {
        console.error('❌ Errore salvataggio quiz:', error.message);
        throw error;
    }
}

/**
 * Aggiorna il conteggio delle domande di un quiz
 */
export async function updateQuizQuestionsCount(quizId: string, count: number): Promise<void> {
    try {
        await supabase
            .from('quizzes')
            .update({ total_questions: count })
            .eq('id', quizId);
    } catch (error: any) {
        console.error('❌ Errore aggiornamento count:', error.message);
    }
}

/**
 * Aggiorna la distribuzione delle difficoltà di un quiz
 */
export async function updateQuizDifficultyDistribution(
    quizId: string,
    distribution: { easy: number; medium: number; hard: number }
): Promise<void> {
    try {
        await supabase
            .from('quizzes')
            .update({ difficulty_distribution: distribution })
            .eq('id', quizId);
    } catch (error: any) {
        console.error('❌ Errore aggiornamento distribution:', error.message);
    }
}

/**
 * Recupera domande di un quiz specifico
 */
export async function getQuizQuestions(quizId: string): Promise<DBQuizQuestion[]> {
    try {
        const { data, error } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('quiz_id', quizId)
            .eq('validation_status', 'validated')
            .order('difficulty', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error: any) {
        console.error('❌ Errore recupero domande quiz:', error.message);
        return [];
    }
}

/**
 * Recupera informazioni complete di un quiz
 */
export async function getQuizById(quizId: string): Promise<DBQuiz | null> {
    try {
        const { data, error } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', quizId)
            .single();

        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error('❌ Errore recupero quiz:', error.message);
        return null;
    }
}

/**
 * Registra il completamento di un quiz da parte di un utente
 */
export async function recordQuizCompletion(
    userId: string,
    quizId: string,
    contentId: string,
    attemptId: string,
    score: number,
    maxScore: number,
    passed: boolean,
    timeTaken?: number
): Promise<void> {
    try {
        const { error } = await supabase
            .from('user_quiz_completions')
            .insert({
                user_id: userId,
                quiz_id: quizId,
                content_id: contentId,
                attempt_id: attemptId,
                score,
                max_score: maxScore,
                passed,
                time_taken: timeTaken
            });

        if (error) {
            // Se l'errore è duplicate key, l'utente ha già completato questo quiz
            if (error.code === '23505') {
                console.warn('⚠️ Utente ha già completato questo quiz');
                return;
            }
            throw error;
        }

        console.log(`✅ Registrato completamento quiz ${quizId} per user ${userId}`);
    } catch (error: any) {
        console.error('❌ Errore registrazione completamento:', error.message);
        throw error;
    }
}

/**
 * Aggiorna l'attempt con il quiz_id
 */
export async function updateQuizAttemptWithQuizId(
    attemptId: string,
    quizId: string
): Promise<void> {
    try {
        const { error } = await supabase
            .from('quiz_attempts')
            .update({ quiz_id: quizId })
            .eq('id', attemptId);

        if (error) throw error;
    } catch (error: any) {
        console.error('❌ Errore aggiornamento attempt:', error.message);
    }
}

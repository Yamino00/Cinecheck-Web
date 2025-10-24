/**
 * API Route: /api/quiz/generate
 * 
 * Sistema intelligente di gestione quiz
 * 
 * POST /api/quiz/generate
 * Body: { user_id: string, tmdb_id: number, content_type: 'movie' | 'series' }
 * 
 * Flow intelligente:
 * 1. Controlla se esistono quiz disponibili che l'utente NON ha fatto
 * 2. Se esiste almeno un quiz disponibile, restituiscilo
 * 3. Se l'utente ha fatto tutti i quiz O non esistono quiz:
 *    - Genera un nuovo quiz con Gemini
 *    - Salvalo come nuova entity nel database
 *    - Restituiscilo
 * 
 * Regola: Un utente non può mai rifare lo stesso quiz due volte
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateQuizQuestions, type TMDBContentData } from '@/lib/gemini';
import {
    getOrCreateContent,
    logGenerationAttempt,
    getAvailableQuizzesForUser,
    userHasCompletedAllQuizzes,
    createQuiz,
    saveQuizQuestionsWithQuizId,
    getQuizQuestions,
    type DBQuizQuestion,
    type DBQuiz,
} from '@/lib/quiz-db';
import { tmdb } from '@/services/tmdb';

// Client Supabase con Service Role Key per eliminazione quiz obsoleti
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        // Parse body
        const body = await request.json();
        let { user_id, tmdb_id, content_type } = body;

        // Normalizza content_type (accetta sia "tv" che "series")
        if (content_type === "tv") {
            content_type = "series";
        }

        // Validazione
        if (!user_id || !tmdb_id || !content_type) {
            return NextResponse.json(
                { error: 'Parametri mancanti: user_id, tmdb_id e content_type richiesti' },
                { status: 400 }
            );
        }

        if (!['movie', 'series'].includes(content_type)) {
            return NextResponse.json(
                { error: 'content_type deve essere "movie", "series" o "tv"' },
                { status: 400 }
            );
        }

        console.log(`\n🎯 Quiz Generation Request (Intelligent): ${content_type} #${tmdb_id} for user ${user_id}`);

        // Step 0: Crea/recupera content_id per questo TMDB ID
        console.log('📋 Step 0: Recupero/creazione content...');
        let contentId: string;
        let tmdbData: any;

        try {
            // Fetch dati TMDB prima di creare content
            if (content_type === 'movie') {
                tmdbData = await tmdb.getMovieComplete(tmdb_id);
            } else {
                tmdbData = await tmdb.getSeriesComplete(tmdb_id);
            }
            console.log(`✅ Dati TMDB recuperati: ${tmdbData.title || tmdbData.name}`);

            contentId = await getOrCreateContent(tmdb_id, content_type, tmdbData);
            console.log(`✅ Content ID: ${contentId}`);
        } catch (error: any) {
            return NextResponse.json(
                { error: 'Impossibile recuperare dati TMDB o creare content', details: error.message },
                { status: 404 }
            );
        }

        // Step 1: Cerca quiz disponibili che l'utente NON ha ancora fatto
        console.log('🔍 Step 1: Ricerca quiz disponibili per utente...');
        let availableQuizzes: DBQuiz[] = [];

        try {
            availableQuizzes = await getAvailableQuizzesForUser(user_id, contentId);
            console.log(`📊 Trovati ${availableQuizzes.length} quiz disponibili`);
        } catch (error: any) {
            console.error('⚠️ Errore recupero quiz disponibili:', error.message);
            // Continuiamo comunque, genereremo un nuovo quiz
        }

        // Step 2: Se esiste almeno un quiz disponibile, restituiscilo
        if (availableQuizzes.length > 0) {
            const selectedQuiz = availableQuizzes[0]; // Prendi il primo (più popolare)
            console.log(`✅ Quiz disponibile trovato: ${selectedQuiz.id}`);
            console.log(`📋 Quiz info:`, {
                title: selectedQuiz.title,
                total_questions: selectedQuiz.total_questions,
                completion_count: selectedQuiz.completion_count,
                is_active: selectedQuiz.is_active
            });

            // Carica le domande del quiz
            console.log(`🔍 Caricamento domande per quiz ${selectedQuiz.id}...`);
            const questions = await getQuizQuestions(selectedQuiz.id);
            console.log(`📊 Domande caricate: ${questions.length}`);

            if (questions.length > 0) {
                console.log(`✅ Restituisco quiz esistente con ${questions.length} domande`);

                return NextResponse.json({
                    success: true,
                    cached: true,
                    reused: true,
                    quiz_id: selectedQuiz.id,
                    quiz: {
                        questions,
                        total_questions: questions.length,
                        content_type,
                        tmdb_id,
                        content_id: contentId,
                        difficulty_distribution: selectedQuiz.difficulty_distribution,
                    },
                    generation_time: Date.now() - startTime,
                    message: 'Quiz riutilizzato dal database'
                });
            } else {
                console.warn(`⚠️ Quiz ${selectedQuiz.id} trovato ma SENZA domande! Possibile problema RLS o dati corrotti.`);
                console.warn(`   Provo con il prossimo quiz disponibile...`);
            }
        }

        // Step 3: L'utente ha fatto tutti i quiz O non esistono quiz
        // Determiniamo il motivo della generazione
        let generationReason = 'no_quiz_exists';
        const hasCompletedAll = await userHasCompletedAllQuizzes(user_id, contentId);

        if (hasCompletedAll) {
            generationReason = 'all_quizzes_completed';
            console.log('🎓 Utente ha completato tutti i quiz esistenti, genero un nuovo quiz...');
        } else {
            console.log('🆕 Nessun quiz esistente per questo contenuto, procedo con generazione...');
        }

        // Step 4: Prepara dati per Gemini
        console.log('🤖 Step 3: Preparazione dati per Gemini...');
        const contentData: TMDBContentData = {
            id: tmdb_id,
            title: tmdbData.title,
            name: tmdbData.name,
            original_title: tmdbData.original_title,
            original_name: tmdbData.original_name,
            overview: tmdbData.overview,
            release_date: tmdbData.release_date,
            first_air_date: tmdbData.first_air_date,
            genres: tmdbData.genres || [],
            cast: tmdbData.credits?.cast?.slice(0, 10) || [],
            crew: tmdbData.credits?.crew?.slice(0, 10) || [],
            runtime: tmdbData.runtime,
            number_of_seasons: tmdbData.number_of_seasons,
            number_of_episodes: tmdbData.number_of_episodes,
            vote_average: tmdbData.vote_average,
            popularity: tmdbData.popularity,
            keywords: content_type === 'movie'
                ? (tmdbData.keywords?.keywords || [])
                : (tmdbData.keywords?.results || []),
            production_companies: tmdbData.production_companies,
            tagline: tmdbData.tagline,
        };

        // Step 5: Genera quiz con Gemini
        console.log('✨ Step 5: Generazione quiz con Gemini AI...');
        let quizResponse;

        try {
            quizResponse = await generateQuizQuestions(contentData, content_type);
            console.log(`✅ Quiz generato: ${quizResponse.questions.length} domande`);
        } catch (error: any) {
            await logGenerationAttempt(
                tmdb_id,
                content_type,
                false,
                `Gemini generation failed: ${error.message}`,
                Date.now() - startTime,
                0,
                generationReason
            );

            return NextResponse.json(
                { error: 'Impossibile generare quiz', details: error.message },
                { status: 500 }
            );
        }

        // Step 6: Crea entity Quiz
        console.log('💾 Step 6: Creazione entity Quiz...');
        let quizId: string;
        const quizTitle = `Quiz ${tmdbData.title || tmdbData.name} #${Date.now()}`;
        const quizDescription = `Quiz autogenerato con AI per ${tmdbData.title || tmdbData.name}`;

        try {
            quizId = await createQuiz(
                contentId,
                quizTitle,
                quizDescription,
                generationReason,
                true, // is_ai_generated
                {
                    model: 'gemini-2.0-flash',
                    generated_at: new Date().toISOString(),
                    content_title: tmdbData.title || tmdbData.name,
                    user_requested: user_id
                }
            );
        } catch (error: any) {
            await logGenerationAttempt(
                tmdb_id,
                content_type,
                false,
                `Quiz entity creation failed: ${error.message}`,
                Date.now() - startTime,
                quizResponse.questions.length,
                generationReason
            );

            return NextResponse.json(
                { error: 'Impossibile creare quiz nel database', details: error.message },
                { status: 500 }
            );
        }

        // Step 7: Salva domande collegate al quiz
        console.log('💾 Step 7: Salvataggio domande nel database...');
        let savedQuestions: DBQuizQuestion[];

        try {
            savedQuestions = await saveQuizQuestionsWithQuizId(
                quizId,
                contentId,
                quizResponse,
                'Generated by Gemini AI',
                contentData
            );
        } catch (error: any) {
            await logGenerationAttempt(
                tmdb_id,
                content_type,
                false,
                `Database save failed: ${error.message}`,
                Date.now() - startTime,
                quizResponse.questions.length,
                generationReason
            );

            return NextResponse.json(
                { error: 'Impossibile salvare domande nel database', details: error.message },
                { status: 500 }
            );
        }

        // Step 8: Log successo
        const generationTime = Date.now() - startTime;
        await logGenerationAttempt(
            tmdb_id,
            content_type,
            true,
            undefined,
            generationTime,
            savedQuestions.length,
            generationReason
        );

        console.log(`✅ Quiz completato in ${generationTime}ms`);

        // Risposta
        return NextResponse.json({
            success: true,
            cached: false,
            reused: false,
            quiz_id: quizId,
            quiz: {
                questions: savedQuestions,
                total_questions: savedQuestions.length,
                content_type,
                tmdb_id,
                content_id: contentId,
            },
            generation_time: generationTime,
            generation_reason: generationReason,
            metadata: {
                content_title: tmdbData.title || tmdbData.name,
                generated_at: new Date().toISOString(),
                model: 'gemini-2.0-flash',
            },
        });

    } catch (error: any) {
        console.error('❌ Errore generale:', error);

        return NextResponse.json(
            { error: 'Errore interno del server', details: error.message },
            { status: 500 }
        );
    }
}

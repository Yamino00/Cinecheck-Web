/**
 * API Route: /api/quiz/generate
 * 
 * Genera o recupera un quiz per un contenuto (film/serie)
 * 
 * POST /api/quiz/generate
 * Body: { tmdb_id: number, content_type: 'movie' | 'series' }
 * 
 * Flow:
 * 1. Verifica se esiste già quiz in DB
 * 2. Se sì, restituisce quiz esistente
 * 3. Se no, fetch dati TMDB → genera con Gemini → salva DB → restituisce
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateQuizQuestions, type TMDBContentData } from '@/lib/gemini';
import {
    getQuizByTmdbId,
    saveQuizQuestions,
    getOrCreateContent,
    logGenerationAttempt,
    type DBQuizQuestion,
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
        let { tmdb_id, content_type } = body;

        // Normalizza content_type (accetta sia "tv" che "series")
        if (content_type === "tv") {
            content_type = "series";
        }

        // Validazione
        if (!tmdb_id || !content_type) {
            return NextResponse.json(
                { error: 'Parametri mancanti: tmdb_id e content_type richiesti' },
                { status: 400 }
            );
        }

        if (!['movie', 'series'].includes(content_type)) {
            return NextResponse.json(
                { error: 'content_type deve essere "movie", "series" o "tv"' },
                { status: 400 }
            );
        }

        console.log(`\n🎯 Quiz Generation Request: ${content_type} #${tmdb_id}`);

        // Step 1: Verifica se esiste già quiz
        console.log('📋 Step 1: Controllo quiz esistente...');
        const existingQuiz = await getQuizByTmdbId(tmdb_id, content_type);

        if (existingQuiz && existingQuiz.length > 0) {
            console.log(`✅ Quiz esistente trovato: ${existingQuiz.length} domande`);

            // Verifica se il quiz ha il numero corretto di domande (10)
            if (existingQuiz.length < 10) {
                console.log(`⚠️ Quiz obsoleto con ${existingQuiz.length} domande. Rigenero...`);

                // Elimina il quiz vecchio
                const contentId = existingQuiz[0].content_id;
                await supabase
                    .from('quiz_questions')
                    .delete()
                    .eq('content_id', contentId);

                console.log('🗑️ Quiz vecchio eliminato, procedo con rigenerazione...');
            } else {
                // Quiz valido con 10 domande, restituiscilo
                const contentId = existingQuiz[0].content_id;

                return NextResponse.json({
                    success: true,
                    cached: true,
                    quiz: {
                        questions: existingQuiz,
                        total_questions: existingQuiz.length,
                        content_type,
                        tmdb_id,
                        content_id: contentId,
                    },
                    generation_time: Date.now() - startTime,
                });
            }
        }

        console.log('🔍 Nessun quiz trovato, procedo con generazione...');

        // Step 2: Fetch dati completi da TMDB
        console.log('📡 Step 2: Recupero dati TMDB...');
        let tmdbData: any;

        try {
            if (content_type === 'movie') {
                tmdbData = await tmdb.getMovieComplete(tmdb_id);
            } else {
                tmdbData = await tmdb.getSeriesComplete(tmdb_id);
            }

            console.log(`✅ Dati TMDB recuperati: ${tmdbData.title || tmdbData.name}`);
        } catch (error: any) {
            await logGenerationAttempt(tmdb_id, content_type, false, `TMDB fetch failed: ${error.message}`);

            return NextResponse.json(
                { error: 'Impossibile recuperare dati TMDB', details: error.message },
                { status: 404 }
            );
        }

        // Step 3: Prepara dati per Gemini
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

        // Step 4: Genera quiz con Gemini
        console.log('✨ Step 4: Generazione quiz con Gemini AI...');
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
                Date.now() - startTime
            );

            return NextResponse.json(
                { error: 'Impossibile generare quiz', details: error.message },
                { status: 500 }
            );
        }

        // Step 5: Crea/recupera content_id
        console.log('💾 Step 5: Creazione/recupero content...');
        let contentId: string;

        try {
            contentId = await getOrCreateContent(tmdb_id, content_type, tmdbData);
        } catch (error: any) {
            await logGenerationAttempt(
                tmdb_id,
                content_type,
                false,
                `Content creation failed: ${error.message}`,
                Date.now() - startTime
            );

            return NextResponse.json(
                { error: 'Impossibile creare contenuto nel database', details: error.message },
                { status: 500 }
            );
        }

        // Step 6: Salva domande nel database
        console.log('💾 Step 6: Salvataggio domande nel database...');
        let savedQuestions: DBQuizQuestion[];

        try {
            savedQuestions = await saveQuizQuestions(
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
                quizResponse.questions.length
            );

            return NextResponse.json(
                { error: 'Impossibile salvare quiz nel database', details: error.message },
                { status: 500 }
            );
        }

        // Step 7: Log successo
        const generationTime = Date.now() - startTime;
        await logGenerationAttempt(
            tmdb_id,
            content_type,
            true,
            undefined,
            generationTime,
            savedQuestions.length
        );

        console.log(`✅ Quiz completato in ${generationTime}ms`);

        // Risposta
        return NextResponse.json({
            success: true,
            cached: false,
            quiz: {
                questions: savedQuestions,
                total_questions: savedQuestions.length,
                content_type,
                tmdb_id,
                content_id: contentId,
            },
            generation_time: generationTime,
            metadata: {
                content_title: tmdbData.title || tmdbData.name,
                generated_at: new Date().toISOString(),
                model: 'gemini-2.5-flash',
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

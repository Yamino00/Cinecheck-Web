/**
 * API Route: /api/quiz/start
 * 
 * Inizia un tentativo quiz per un utente su un quiz specifico
 * 
 * POST /api/quiz/start
 * Body: { user_id: string, quiz_id: string, content_id: string }
 * 
 * Flow:
 * 1. Recupera domande del quiz specifico dal DB
 * 2. Randomizza ordine domande
 * 3. Crea record quiz_attempts (con quiz_id)
 * 4. Restituisce domande (senza correct_answer per sicurezza)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
    createQuizAttempt, 
    updateQuizAttemptWithQuizId,
    getQuizQuestions,
    type DBQuizQuestion 
} from '@/lib/quiz-db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase con Service Role Key (bypassa RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

/**
 * Randomizza array (Fisher-Yates shuffle)
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export async function POST(request: NextRequest) {
    try {
        // Parse body
        const body = await request.json();
        const { user_id, quiz_id, content_id } = body;

        // Validazione
        if (!user_id || !quiz_id || !content_id) {
            return NextResponse.json(
                { error: 'Parametri mancanti: user_id, quiz_id e content_id richiesti' },
                { status: 400 }
            );
        }

        console.log(`\n🎮 Quiz Start Request: user=${user_id}, quiz=${quiz_id}, content=${content_id}`);

        // Step 1: Recupera domande del quiz specifico
        console.log('📋 Step 1: Recupero domande quiz...');
        const questions = await getQuizQuestions(quiz_id);

        if (!questions || questions.length === 0) {
            return NextResponse.json(
                { error: 'Nessuna domanda disponibile per questo quiz' },
                { status: 404 }
            );
        }

        console.log(`✅ ${questions.length} domande recuperate per quiz ${quiz_id}`);

        // Step 2: Randomizza ordine domande
        console.log('🔀 Step 2: Randomizzazione domande...');
        const shuffledQuestions = shuffleArray(questions as DBQuizQuestion[]);

        // Step 3: Randomizza ordine risposte per ogni domanda
        const questionsWithShuffledAnswers = shuffledQuestions.map(q => {
            const allAnswers = [
                { text: q.correct_answer, is_correct: true },
                ...q.wrong_answers.map((a: string) => ({ text: a, is_correct: false })),
            ];

            const shuffledAnswers = shuffleArray(allAnswers);

            return {
                id: q.id,
                question: q.question,
                answers: shuffledAnswers.map(a => a.text), // Solo testi, senza is_correct
                difficulty: q.difficulty,
                category: q.category,
                time_limit: q.time_limit,
                points: q.points,
                hint: q.hint,
            };
        });

        // Step 4: Crea tentativo quiz
        console.log('💾 Step 3: Creazione tentativo quiz...');
        const questionIds = shuffledQuestions.map(q => q.id);

        let attemptId: string;
        try {
            attemptId = await createQuizAttempt(user_id, content_id, questionIds);
            // Collega il quiz_id all'attempt
            await updateQuizAttemptWithQuizId(attemptId, quiz_id);
        } catch (error: any) {
            console.error('❌ Errore creazione tentativo:', error);
            return NextResponse.json(
                { error: 'Impossibile creare tentativo quiz', details: error.message },
                { status: 500 }
            );
        }

        console.log(`✅ Quiz avviato: attempt_id=${attemptId}, quiz_id=${quiz_id}`);

        // Calcola informazioni quiz
        const totalPoints = questions.reduce((sum: number, q: any) => sum + (q.points || 10), 0);
        const difficultyBreakdown = {
            easy: questions.filter((q: any) => q.difficulty === 'easy').length,
            medium: questions.filter((q: any) => q.difficulty === 'medium').length,
            hard: questions.filter((q: any) => q.difficulty === 'hard').length,
        };

        // Risposta (senza correct_answer per sicurezza)
        return NextResponse.json({
            success: true,
            attempt_id: attemptId,
            quiz: {
                questions: questionsWithShuffledAnswers,
                total_questions: questions.length,
                total_points: totalPoints,
                difficulty_breakdown: difficultyBreakdown,
                pass_threshold: Math.ceil(totalPoints * 0.6), // 60% per passare
            },
            started_at: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('❌ Errore generale:', error);

        return NextResponse.json(
            { error: 'Errore interno del server', details: error.message },
            { status: 500 }
        );
    }
}

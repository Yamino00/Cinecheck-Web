/**
 * API Route: /api/quiz/submit
 * 
 * Invia risposte quiz e calcola risultato
 * 
 * POST /api/quiz/submit
 * Body: { 
 *   attempt_id: string,
 *   answers: Array<{ question_id: string, selected_answer: string }>,
 *   time_taken: number (secondi)
 * }
 * 
 * Flow:
 * 1. Valida attempt_id
 * 2. Recupera domande e correct_answers
 * 3. Calcola score
 * 4. Aggiorna statistiche domande
 * 5. Aggiorna quiz_attempts con risultato
 * 6. Aggiorna profilo utente (quiz_success_rate)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { updateQuizAttempt, updateQuestionStatistics } from '@/lib/quiz-db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase con Service Role Key (bypassa RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

export async function POST(request: NextRequest) {
    try {
        // Parse body
        const body = await request.json();
        const { attempt_id, answers, time_taken } = body;

        // Validazione
        if (!attempt_id || !answers || !Array.isArray(answers)) {
            return NextResponse.json(
                { error: 'Parametri mancanti o non validi' },
                { status: 400 }
            );
        }

        console.log(`\n📝 Quiz Submit: attempt=${attempt_id}, answers=${answers.length}`);

        // Step 1: Recupera tentativo
        console.log('🔍 Step 1: Verifica tentativo...');
        const { data: attempt, error: attemptError } = await supabase
            .from('quiz_attempts')
            .select('id, user_id, content_id, questions, max_score, passed')
            .eq('id', attempt_id)
            .single();

        if (attemptError || !attempt) {
            return NextResponse.json(
                { error: 'Tentativo quiz non trovato' },
                { status: 404 }
            );
        }

        // Verifica che non sia già stato completato
        if (attempt.passed !== false || attempt.max_score === 0) {
            // Se passed è true o max_score non è 0, è già stato completato
            const { data: completedAttempt } = await supabase
                .from('quiz_attempts')
                .select('score, max_score, passed')
                .eq('id', attempt_id)
                .single();

            if (completedAttempt && completedAttempt.score > 0) {
                return NextResponse.json(
                    { error: 'Quiz già completato' },
                    { status: 400 }
                );
            }
        }

        const questionIds = attempt.questions.question_ids;
        console.log(`✅ Tentativo trovato: ${questionIds.length} domande`);

        // Step 2: Recupera domande con risposte corrette
        console.log('📋 Step 2: Recupero domande...');
        const { data: questions, error: questionsError } = await supabase
            .from('quiz_questions')
            .select('id, correct_answer, points, difficulty')
            .in('id', questionIds);

        if (questionsError || !questions) {
            return NextResponse.json(
                { error: 'Impossibile recuperare domande' },
                { status: 500 }
            );
        }

        // Step 3: Calcola score
        console.log('🎯 Step 3: Calcolo punteggio...');
        let totalScore = 0;
        let correctAnswers = 0;
        const results: Array<{
            question_id: string;
            selected_answer: string;
            correct_answer: string;
            is_correct: boolean;
            points_earned: number;
            difficulty: string;
        }> = [];

        for (const answer of answers) {
            const question = questions.find(q => q.id === answer.question_id);

            if (!question) {
                console.warn(`⚠️ Domanda non trovata: ${answer.question_id}`);
                continue;
            }

            const isCorrect = answer.selected_answer.trim().toLowerCase() ===
                question.correct_answer.trim().toLowerCase();

            const pointsEarned = isCorrect ? question.points : 0;
            totalScore += pointsEarned;

            if (isCorrect) {
                correctAnswers++;
            }

            results.push({
                question_id: question.id,
                selected_answer: answer.selected_answer,
                correct_answer: question.correct_answer,
                is_correct: isCorrect,
                points_earned: pointsEarned,
                difficulty: question.difficulty,
            });

            // Aggiorna statistiche domanda
            await updateQuestionStatistics(question.id, isCorrect);
        }

        const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
        const percentage = Math.round((totalScore / maxScore) * 100);
        const passed = percentage >= 60; // 60% per passare

        console.log(`✅ Score: ${totalScore}/${maxScore} (${percentage}%) - ${passed ? 'PASSED' : 'FAILED'}`);

        // Step 4: Recupera le domande complete per la risposta
        console.log('📚 Step 4: Recupero domande complete...');
        const { data: fullQuestions, error: fullQuestionsError } = await supabase
            .from('quiz_questions')
            .select('*')
            .in('id', questionIds)
            .order('difficulty', { ascending: true }); // Ordina per difficoltà

        if (fullQuestionsError || !fullQuestions) {
            console.warn('⚠️ Impossibile recuperare domande complete');
        }

        // Calcola performance per difficoltà
        const easyQuestions = results.filter(r => r.difficulty === 'easy');
        const mediumQuestions = results.filter(r => r.difficulty === 'medium');
        const hardQuestions = results.filter(r => r.difficulty === 'hard');

        const performance = {
            easy: {
                correct: easyQuestions.filter(q => q.is_correct).length,
                total: easyQuestions.length,
            },
            medium: {
                correct: mediumQuestions.filter(q => q.is_correct).length,
                total: mediumQuestions.length,
            },
            hard: {
                correct: hardQuestions.filter(q => q.is_correct).length,
                total: hardQuestions.length,
            },
        };

        // Step 5: Aggiorna tentativo
        console.log('💾 Step 5: Aggiornamento tentativo...');
        await updateQuizAttempt(
            attempt_id,
            totalScore,
            maxScore,
            time_taken || 0,
            passed
        );

        // Step 6: Aggiorna statistiche profilo utente
        console.log('👤 Step 6: Aggiornamento profilo...');
        try {
            // Recupera tutti i tentativi passati dell'utente
            const { data: userAttempts } = await supabase
                .from('quiz_attempts')
                .select('passed')
                .eq('user_id', attempt.user_id);

            if (userAttempts && userAttempts.length > 0) {
                const totalAttempts = userAttempts.length;
                const passedAttempts = userAttempts.filter(a => a.passed).length;
                const successRate = (passedAttempts / totalAttempts) * 100;

                await supabase
                    .from('profiles')
                    .update({ quiz_success_rate: successRate })
                    .eq('id', attempt.user_id);

                console.log(`✅ Profilo aggiornato: ${Math.round(successRate)}% success rate`);
            }
        } catch (error: any) {
            console.warn('⚠️ Errore aggiornamento profilo:', error.message);
        }

        // Risposta completa con tutte le domande e risposte
        return NextResponse.json({
            success: true,
            score: totalScore,
            max_score: maxScore,
            percentage,
            passed,
            correct_answers: correctAnswers,
            total_questions: questions.length,
            performance,
            questions: fullQuestions?.map(q => {
                const result = results.find(r => r.question_id === q.id);
                return {
                    ...q,
                    user_answer: result?.selected_answer || '',
                    is_correct: result?.is_correct || false,
                };
            }) || [],
            message: passed
                ? '🎉 Congratulazioni! Hai superato il quiz!'
                : '💪 Riprova! Hai bisogno di almeno il 60% per passare.',
        });

    } catch (error: any) {
        console.error('❌ Errore generale:', error);

        return NextResponse.json(
            { error: 'Errore interno del server', details: error.message },
            { status: 500 }
        );
    }
}

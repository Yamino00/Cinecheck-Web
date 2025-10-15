import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const tmdbId = searchParams.get("tmdb_id");
        const type = searchParams.get("type");

        if (!tmdbId || !type) {
            return NextResponse.json(
                { error: "Missing tmdb_id or type parameter" },
                { status: 400 }
            );
        }

        // Ottieni userId dalla sessione
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json({ hasPassed: false });
        }

        const token = authHeader.replace("Bearer ", "");
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ hasPassed: false });
        }

        // Trova il content_id dal tmdb_id
        const contentType = type === "tv" ? "series" : type;
        const { data: content, error: contentError } = await supabase
            .from("contents")
            .select("id")
            .eq("tmdb_id", parseInt(tmdbId))
            .eq("type", contentType)
            .single();

        if (contentError || !content) {
            return NextResponse.json({ hasPassed: false });
        }

        // Verifica se l'utente ha passato almeno un quiz per questo contenuto
        // Controlla in user_quiz_completions (sistema intelligente)
        const { data: completions, error: completionsError } = await supabase
            .from("user_quiz_completions")
            .select("id, passed")
            .eq("user_id", user.id)
            .eq("content_id", content.id)
            .eq("passed", true)  // Solo quiz passati
            .limit(1);

        if (completionsError) {
            console.error("Error checking quiz completions:", completionsError);
            // Fallback: controlla la vecchia tabella quiz_attempts
            const { data: attempts } = await supabase
                .from("quiz_attempts")
                .select("passed")
                .eq("user_id", user.id)
                .eq("content_id", content.id)
                .eq("passed", true)
                .limit(1);
                
            return NextResponse.json({
                hasPassed: attempts && attempts.length > 0,
            });
        }

        const hasPassed = completions && completions.length > 0;

        // Opzionale: verifica anche se ci sono quiz disponibili da fare
        const { data: availableQuizzes } = await supabase
            .rpc('get_available_quizzes_for_user', {
                p_user_id: user.id,
                p_content_id: content.id,
                p_limit: 1
            });

        const canRetryQuiz = availableQuizzes && availableQuizzes.length > 0;

        return NextResponse.json({
            hasPassed,
            canRetryQuiz,  // Indica se ci sono altri quiz disponibili
            message: hasPassed 
                ? "L'utente ha superato almeno un quiz" 
                : canRetryQuiz 
                    ? "L'utente può fare altri quiz"
                    : "Nessun quiz disponibile"
        });
    } catch (error) {
        console.error("Error in check-status API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

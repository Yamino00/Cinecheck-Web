/**
 * Google Gemini AI Integration
 * 
 * Questo modulo gestisce l'integrazione con Google Gemini API
 * per la generazione automatica di quiz su film e serie TV.
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Configurazione
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY || '';
const MODEL_NAME = 'gemini-2.0-flash'; // Gemini 2.0 Flash (stable) - Testing
const GENERATION_CONFIG = {
    temperature: 0.8, // Creatività moderata
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
};

// Inizializza client
let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

/**
 * Inizializza il client Gemini AI
 */
function initializeGemini() {
    if (!API_KEY) {
        throw new Error('GOOGLE_GEMINI_API_KEY non configurata nelle variabili d\'ambiente');
    }

    if (!genAI) {
        genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: GENERATION_CONFIG,
        });
    }

    return model!;
}

/**
 * Interfacce per i dati TMDB
 */
export interface TMDBContentData {
    id: number;
    title?: string;
    name?: string;
    original_title?: string;
    original_name?: string;
    overview: string;
    release_date?: string;
    first_air_date?: string;
    genres: Array<{ id: number; name: string }>;
    cast: Array<{
        name: string;
        character: string;
        order: number;
    }>;
    crew: Array<{
        name: string;
        job: string;
        department: string;
    }>;
    runtime?: number;
    number_of_seasons?: number;
    number_of_episodes?: number;
    vote_average: number;
    popularity: number;
    keywords: Array<{ id: number; name: string }>;
    production_companies?: Array<{ id: number; name: string }>;
    tagline?: string;
}

/**
 * Interfaccia per una singola domanda del quiz
 */
export interface QuizQuestion {
    question: string;
    correct_answer: string;
    wrong_answers: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    hint?: string;
    explanation: string;
    time_limit: number;
    points: number;
}

/**
 * Interfaccia per la risposta di Gemini
 */
export interface GeminiQuizResponse {
    questions: QuizQuestion[];
    metadata: {
        generated_at: string;
        content_title: string;
        content_type: 'movie' | 'series';
        total_questions: number;
    };
}

/**
 * Costruisce il prompt per Gemini
 */
function buildQuizPrompt(contentData: TMDBContentData, contentType: 'movie' | 'series'): string {
    const title = contentData.title || contentData.name || 'Contenuto sconosciuto';
    const releaseYear = contentData.release_date
        ? new Date(contentData.release_date).getFullYear()
        : contentData.first_air_date
            ? new Date(contentData.first_air_date).getFullYear()
            : 'N/A';

    const directors = contentData.crew
        ?.filter(c => c.job === 'Director')
        .map(c => c.name)
        .slice(0, 3)
        .join(', ') || 'N/A';

    const mainCast = contentData.cast
        ?.slice(0, 5)
        .map(c => `${c.name} (${c.character})`)
        .join(', ') || 'N/A';

    const genres = contentData.genres?.map(g => g.name).join(', ') || 'N/A';
    const keywords = contentData.keywords?.slice(0, 10).map(k => k.name).join(', ') || 'N/A';

    return `Sei un esperto di cinema e TV che crea quiz coinvolgenti e accurati.

# CONTENUTO DA ANALIZZARE

**Titolo:** ${title}
**Anno:** ${releaseYear}
**Tipo:** ${contentType === 'movie' ? 'Film' : 'Serie TV'}
**Generi:** ${genres}
**Regia:** ${directors}
**Cast principale:** ${mainCast}
**Durata:** ${contentData.runtime ? `${contentData.runtime} minuti` : contentData.number_of_episodes ? `${contentData.number_of_episodes} episodi` : 'N/A'}
**Trama:** ${contentData.overview || 'Non disponibile'}
**Keywords:** ${keywords}
${contentData.tagline ? `**Tagline:** ${contentData.tagline}` : ''}

# ISTRUZIONI

Genera **8 domande a risposta multipla** per un quiz su questo ${contentType === 'movie' ? 'film' : 'serie TV'}.

**REQUISITI OBBLIGATORI:**

1. **Varietà di difficoltà:**
   - 3 domande EASY (informazioni base: anno, genere, cast principale)
   - 3 domande MEDIUM (trama, personaggi secondari, citazioni famose)
   - 2 domande HARD (dettagli specifici, easter eggs, curiosità produzione)

2. **Categorie diverse:**
   - Cast & Crew
   - Trama & Personaggi
   - Produzione & Curiosità
   - Citazioni & Scene iconiche

3. **Formato risposta:**
   - Ogni domanda ha 4 opzioni (1 corretta + 3 sbagliate)
   - Le risposte sbagliate devono essere plausibili ma chiaramente errate
   - Evita risposte troppo ovvie o assurde

4. **Qualità:**
   - Domande chiare e senza ambiguità
   - Hint opzionale per domande HARD
   - Spiegazione dettagliata della risposta corretta

**FORMATO JSON RICHIESTO:**

\`\`\`json
{
  "questions": [
    {
      "question": "Testo della domanda?",
      "correct_answer": "Risposta corretta",
      "wrong_answers": ["Risposta sbagliata 1", "Risposta sbagliata 2", "Risposta sbagliata 3"],
      "difficulty": "easy|medium|hard",
      "category": "Cast & Crew|Trama & Personaggi|Produzione & Curiosità|Citazioni & Scene iconiche",
      "hint": "Suggerimento opzionale (solo per hard)",
      "explanation": "Spiegazione dettagliata della risposta corretta",
      "time_limit": 30,
      "points": 10
    }
  ],
  "metadata": {
    "generated_at": "${new Date().toISOString()}",
    "content_title": "${title}",
    "content_type": "${contentType}",
    "total_questions": 8
  }
}
\`\`\`

**IMPORTANTE:** 
- Restituisci SOLO il JSON, senza testo aggiuntivo prima o dopo
- Assicurati che il JSON sia valido e parsabile
- Non inventare informazioni: usa solo i dati forniti
- Se mancano dati per una categoria, usa altre categorie`;
}

/**
 * Valida la risposta di Gemini
 */
function validateQuizResponse(response: any): GeminiQuizResponse {
    if (!response || typeof response !== 'object') {
        throw new Error('Risposta non valida: formato non corretto');
    }

    if (!Array.isArray(response.questions) || response.questions.length === 0) {
        throw new Error('Risposta non valida: array questions mancante o vuoto');
    }

    if (!response.metadata || !response.metadata.content_title) {
        throw new Error('Risposta non valida: metadata mancante');
    }

    // Valida ogni domanda
    response.questions.forEach((q: any, index: number) => {
        if (!q.question || typeof q.question !== 'string') {
            throw new Error(`Domanda ${index + 1}: campo 'question' mancante o non valido`);
        }

        if (!q.correct_answer || typeof q.correct_answer !== 'string') {
            throw new Error(`Domanda ${index + 1}: campo 'correct_answer' mancante o non valido`);
        }

        if (!Array.isArray(q.wrong_answers) || q.wrong_answers.length !== 3) {
            throw new Error(`Domanda ${index + 1}: 'wrong_answers' deve essere un array di 3 elementi`);
        }

        if (!['easy', 'medium', 'hard'].includes(q.difficulty)) {
            throw new Error(`Domanda ${index + 1}: difficulty deve essere 'easy', 'medium' o 'hard'`);
        }

        if (!q.category || typeof q.category !== 'string') {
            throw new Error(`Domanda ${index + 1}: campo 'category' mancante o non valido`);
        }

        if (!q.explanation || typeof q.explanation !== 'string') {
            throw new Error(`Domanda ${index + 1}: campo 'explanation' mancante o non valido`);
        }

        // Valori di default se mancanti
        q.time_limit = q.time_limit || 30;
        q.points = q.points || 10;
    });

    return response as GeminiQuizResponse;
}

/**
 * Genera domande del quiz usando Gemini AI
 * 
 * @param contentData - Dati del contenuto da TMDB
 * @param contentType - Tipo di contenuto ('movie' o 'series')
 * @param retries - Numero di tentativi in caso di errore
 * @returns Array di domande del quiz
 */
export async function generateQuizQuestions(
    contentData: TMDBContentData,
    contentType: 'movie' | 'series',
    retries = 2
): Promise<GeminiQuizResponse> {
    const startTime = Date.now();

    try {
        // Inizializza client
        const model = initializeGemini();

        // Costruisci prompt
        const prompt = buildQuizPrompt(contentData, contentType);

        // Chiamata a Gemini con timeout esteso (30 secondi per prompt complessi)
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Timeout: Gemini non ha risposto entro 30 secondi')), 30000);
        });

        const generationPromise = model.generateContent(prompt);

        const result = await Promise.race([generationPromise, timeoutPromise]);        // Estrai testo dalla risposta
        const responseText = result.response.text();

        // Parse JSON (rimuovi eventuali markdown code blocks)
        const cleanedText = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const parsedResponse = JSON.parse(cleanedText);

        // Valida risposta
        const validatedResponse = validateQuizResponse(parsedResponse);

        // Log tempo di generazione
        const generationTime = Date.now() - startTime;
        console.log(`✅ Quiz generato in ${generationTime}ms per "${validatedResponse.metadata.content_title}"`);

        return validatedResponse;

    } catch (error: any) {
        console.error(`❌ Errore generazione quiz (tentativo ${3 - retries}/3):`, error.message);

        // Retry se ci sono tentativi rimasti
        if (retries > 0) {
            console.log(`🔄 Riprovo... (${retries} tentativi rimasti)`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Attendi 1s
            return generateQuizQuestions(contentData, contentType, retries - 1);
        }

        // Fallback: errore finale
        throw new Error(`Impossibile generare quiz dopo 3 tentativi: ${error.message}`);
    }
}

/**
 * Testa la connessione con Gemini
 */
export async function testGeminiConnection(): Promise<boolean> {
    try {
        const model = initializeGemini();
        const result = await model.generateContent('Test connection. Rispondi solo con "OK".');
        const response = result.response.text();
        console.log('✅ Gemini connesso:', response);
        return true;
    } catch (error: any) {
        console.error('❌ Errore connessione Gemini:', error.message);
        return false;
    }
}

/**
 * Calcola quality score basato su metriche
 */
export function calculateQualityScore(
    timesAnswered: number,
    timesCorrect: number
): number {
    if (timesAnswered === 0) return 0;

    const correctRate = timesCorrect / timesAnswered;

    // Score ideale: 60-80% di risposte corrette
    // Troppo facile (>80%) o troppo difficile (<40%) = score basso
    if (correctRate >= 0.6 && correctRate <= 0.8) {
        return 1.0; // Perfetto
    } else if (correctRate >= 0.4 && correctRate < 0.6) {
        return 0.8; // Buono (un po' difficile)
    } else if (correctRate > 0.8 && correctRate <= 0.9) {
        return 0.7; // Discreto (troppo facile)
    } else if (correctRate >= 0.3 && correctRate < 0.4) {
        return 0.6; // Sufficiente (molto difficile)
    } else {
        return 0.3; // Insufficiente (troppo estremo)
    }
}

/**
 * Test rapido API Quiz Generate
 * Testa l'endpoint /api/quiz/generate che usa Gemini internamente
 * Seleziona ogni volta un film diverso a caso
 */

// Lista di film popolari da testare
const POPULAR_MOVIES = [
    { id: 27205, title: 'Inception' },
    { id: 550, title: 'Fight Club' },
    { id: 155, title: 'The Dark Knight' },
    { id: 13, title: 'Forrest Gump' },
    { id: 19404, title: 'Dilwale Dulhania Le Jayenge' },
    { id: 278, title: 'The Shawshank Redemption' },
    { id: 238, title: 'The Godfather' },
    { id: 680, title: 'Pulp Fiction' },
    { id: 424, title: 'Schindler\'s List' },
    { id: 129, title: 'Spirited Away' },
    { id: 11, title: 'Star Wars' },
    { id: 120, title: 'The Lord of the Rings: The Fellowship of the Ring' },
    { id: 122, title: 'The Lord of the Rings: The Return of the King' },
    { id: 497, title: 'The Green Mile' },
    { id: 346, title: 'Seven Samurai' },
    { id: 769, title: 'GoodFellas' },
    { id: 475557, title: 'Joker' },
    { id: 603, title: 'The Matrix' },
    { id: 637, title: 'Life Is Beautiful' },
    { id: 429, title: 'The Good, the Bad and the Ugly' }
];

console.log('🧪 Test API Quiz Generate con Gemini\n');

async function testGenerateAPI() {
    try {
        // Seleziona un film casuale
        const randomMovie = POPULAR_MOVIES[Math.floor(Math.random() * POPULAR_MOVIES.length)];

        console.log(`🎬 Film selezionato casualmente: ${randomMovie.title} (ID: ${randomMovie.id})\n`);
        console.log('📡 Chiamata a /api/quiz/generate...');

        const startTime = Date.now();

        const response = await fetch('http://localhost:3000/api/quiz/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tmdb_id: randomMovie.id,
                content_type: 'movie'
            })
        });

        const endTime = Date.now();
        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Errore API:', data.error);
            console.error('Details:', data.details || 'N/A');
            return;
        }

        console.log('✅ Quiz generato con successo!');
        console.log(`⏱️  Tempo: ${endTime - startTime}ms`);
        console.log(`📦 Cached: ${data.cached ? 'Sì' : 'No (generato da Gemini)'}`);

        // Gestisci struttura dati (può essere data.questions, data.quiz.questions o data.data.questions)
        const questions = data.questions || data.quiz?.questions || data.data?.questions;
        const content_id = data.content_id || data.quiz?.content_id;

        console.log(`🎯 Content ID: ${content_id}`);

        if (!questions || !Array.isArray(questions)) {
            console.error('❌ Struttura dati non valida');
            console.log('Dati ricevuti:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
            return;
        } console.log(`📝 Domande: ${questions.length}\n`);

        // Mostra distribuzione difficoltà
        const easy = questions.filter((q: any) => q.difficulty === 'easy').length;
        const medium = questions.filter((q: any) => q.difficulty === 'medium').length;
        const hard = questions.filter((q: any) => q.difficulty === 'hard').length;

        console.log('📊 Distribuzione Difficoltà:');
        console.log(`   🟢 Facili: ${easy}`);
        console.log(`   🟡 Medie: ${medium}`);
        console.log(`   🔴 Difficili: ${hard}\n`);

        // Mostra prima domanda come esempio
        console.log('📋 Esempio domanda:');
        console.log(`   Domanda: ${questions[0].question}`);
        console.log(`   Difficoltà: ${questions[0].difficulty}`);
        console.log(`   Punti: ${questions[0].points}`);
        console.log(`   Risposte: ${questions[0].answers?.length || 4}\n`);

        if (!data.cached) {
            console.log('✨ Gemini AI ha generato con successo il quiz!');
            console.log(`   Modello usato: gemini-2.0-flash`);
        } else {
            console.log('💾 Quiz recuperato dalla cache (già generato in precedenza)');
        }

    } catch (error) {
        console.error('❌ Errore durante il test:', error);
        if (error instanceof Error) {
            console.error('   Message:', error.message);
        }
    }
}

// Esegui il test
testGenerateAPI();

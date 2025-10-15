/**
 * Test script per il sistema intelligente di quiz
 * 
 * Esegui con: npx tsx scripts/test-intelligent-quiz.ts
 */

import { config } from 'dotenv';
config();

// Simula diversi utenti che fanno quiz sullo stesso contenuto
async function testIntelligentQuizSystem() {
  const API_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const TMDB_ID = 27205; // Inception
  const CONTENT_TYPE = 'movie';

  // Simula 3 utenti diversi
  const testUsers = [
    { id: 'user-001', name: 'Alice' },
    { id: 'user-002', name: 'Bob' },
    { id: 'user-003', name: 'Charlie' },
  ];

  console.log('\n🧪 TEST SISTEMA INTELLIGENTE DI QUIZ\n');
  console.log('═'.repeat(50));
  console.log(`📍 Testing su: ${CONTENT_TYPE} #${TMDB_ID} (Inception)`);
  console.log('═'.repeat(50));

  for (const user of testUsers) {
    console.log(`\n👤 Testing con ${user.name} (${user.id}):\n`);

    // Test 1: Prima richiesta quiz
    console.log('  📝 Richiesta quiz (prima volta)...');
    try {
      const response = await fetch(`${API_URL}/api/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          tmdb_id: TMDB_ID,
          content_type: CONTENT_TYPE,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`  ❌ Errore: ${data.error}`);
        continue;
      }

      console.log(`  ✅ Quiz ottenuto!`);
      console.log(`     - Quiz ID: ${data.quiz_id}`);
      console.log(`     - Riutilizzato: ${data.reused ? '♻️ SÌ' : '🆕 NO (nuovo)'}`);
      console.log(`     - Cached: ${data.cached ? 'SÌ' : 'NO'}`);
      
      if (!data.reused && data.generation_reason) {
        console.log(`     - Motivo generazione: ${data.generation_reason}`);
      }
      
      console.log(`     - Tempo: ${data.generation_time}ms`);
      console.log(`     - Domande: ${data.quiz?.total_questions || 0}`);

      // Test 2: Seconda richiesta (dovrebbe dare un quiz diverso o generarne uno nuovo)
      console.log('\n  📝 Richiesta quiz (seconda volta)...');
      
      const response2 = await fetch(`${API_URL}/api/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          tmdb_id: TMDB_ID,
          content_type: CONTENT_TYPE,
        }),
      });

      const data2 = await response2.json();

      if (!response2.ok) {
        console.error(`  ❌ Errore: ${data2.error}`);
        continue;
      }

      console.log(`  ✅ Quiz ottenuto!`);
      console.log(`     - Quiz ID: ${data2.quiz_id}`);
      console.log(`     - È diverso dal primo: ${data2.quiz_id !== data.quiz_id ? '✅ SÌ' : '❌ NO'}`);
      console.log(`     - Riutilizzato: ${data2.reused ? '♻️ SÌ' : '🆕 NO (nuovo)'}`);
      
      if (data2.generation_reason === 'all_quizzes_completed') {
        console.log(`     - 🎆 L'utente ha completato tutti i quiz esistenti!`);
      }

    } catch (error) {
      console.error(`  ❌ Errore di rete:`, error);
    }

    console.log('  ' + '─'.repeat(40));
  }

  console.log('\n' + '═'.repeat(50));
  console.log('📊 RISULTATI ATTESI:');
  console.log('═'.repeat(50));
  console.log('1️⃣ Alice: Primo quiz generato (nuovo), secondo riutilizzato o nuovo');
  console.log('2️⃣ Bob: Dovrebbe riutilizzare il quiz di Alice');
  console.log('3️⃣ Charlie: Dovrebbe riutilizzare uno dei quiz esistenti');
  console.log('\n✅ Se tutti ricevono quiz diversi quando li richiedono 2 volte = Sistema funziona!');
  console.log('♻️ Se Bob e Charlie riutilizzano quiz esistenti = Ottimizzazione attiva!');
  console.log('🆕 Se vengono generati nuovi quiz quando necessario = Generazione dinamica OK!');
  console.log('\n');
}

// Esegui test
testIntelligentQuizSystem().catch(console.error);
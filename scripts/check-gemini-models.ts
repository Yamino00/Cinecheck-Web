/**
 * Script per verificare modelli disponibili in Gemini API
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { GoogleGenerativeAI } from '@google/generative-ai';

async function main() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ GOOGLE_GEMINI_API_KEY non trovata');
        process.exit(1);
    }

    console.log('🔑 API Key trovata:', apiKey.substring(0, 10) + '...');

    const genAI = new GoogleGenerativeAI(apiKey);

    console.log('\n📋 Test tutti i modelli Gemini 2.0+\n');
    console.log('━'.repeat(70));

    // Lista completa modelli Gemini 2.0 e successivi
    const modelsToTest = [
        // Gemini 2.5
        'gemini-2.5-pro-latest',
        'gemini-2.5-pro',
        'gemini-2.5-pro-exp',
        'gemini-2.5-flash-latest',
        'gemini-2.5-flash',
        'gemini-2.5-flash-exp',

        // Gemini 2.0
        'gemini-2.0-flash-exp',
        'gemini-2.0-flash-latest',
        'gemini-2.0-flash',
        'gemini-2.0-pro-exp',
        'gemini-2.0-pro',

        // Experimental
        'gemini-exp-1206',
        'gemini-exp-1121',
        'gemini-exp-1114',
    ];

    const workingModels: string[] = [];
    const failedModels: Array<{ model: string; error: string }> = [];

    for (const modelName of modelsToTest) {
        process.stdout.write(`\n🔍 Testing ${modelName.padEnd(30)} ... `);

        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Rispondi solo con "OK"');
            const response = result.response.text();

            console.log(`✅ FUNZIONA (risposta: "${response.trim().substring(0, 20)}")`);
            workingModels.push(modelName);
        } catch (error: any) {
            const errorMsg = error.message.split('\n')[0];
            console.log(`❌ ERRORE`);
            failedModels.push({ model: modelName, error: errorMsg });
        }
    }

    // Riepilogo
    console.log('\n' + '━'.repeat(70));
    console.log('\n📊 RIEPILOGO:\n');

    console.log(`✅ Modelli funzionanti: ${workingModels.length}`);
    if (workingModels.length > 0) {
        workingModels.forEach(model => {
            console.log(`   - ${model}`);
        });
    }

    console.log(`\n❌ Modelli non disponibili: ${failedModels.length}`);

    // Mostra solo primi 3 errori per non appesantire
    if (failedModels.length > 0) {
        console.log('\nPrimi errori (dettagli):');
        failedModels.slice(0, 3).forEach(({ model, error }) => {
            console.log(`\n   ${model}:`);
            console.log(`   ${error.substring(0, 150)}...`);
        });

        if (failedModels.length > 3) {
            console.log(`\n   ... e altri ${failedModels.length - 3} modelli non disponibili`);
        }
    }

    // Raccomandazione
    if (workingModels.length > 0) {
        console.log('\n' + '━'.repeat(70));
        console.log('\n💡 RACCOMANDAZIONE:\n');

        // Priorità: 2.5 > 2.0, Flash > Pro, Latest > Exp
        const recommended = workingModels.find(m => m.includes('2.5-flash-latest')) ||
            workingModels.find(m => m.includes('2.5-flash')) ||
            workingModels.find(m => m.includes('2.0-flash-exp')) ||
            workingModels[0];

        console.log(`   🎯 Usa: ${recommended}`);
        console.log('   📌 Motivi:');

        if (recommended.includes('2.5')) {
            console.log('      - Versione più recente (Gemini 2.5)');
        }
        if (recommended.includes('flash')) {
            console.log('      - Flash = Veloce ed economico');
        }
        if (recommended.includes('latest')) {
            console.log('      - Latest = Versione stabile e aggiornata');
        }
        if (recommended.includes('exp')) {
            console.log('      - Experimental = Funzionalità avanzate (ma può cambiare)');
        }
    }

    console.log('\n' + '━'.repeat(70));
}

main();

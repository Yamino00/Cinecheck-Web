# 🎯 Comportamento Sistema Quiz - Documentazione Completa

## 📐 Regole Fondamentali

### 1️⃣ **Un utente NON può MAI rifare lo stesso quiz**
- Ogni quiz ha un ID univoco
- Una volta fatto (passato o fallito), viene registrato in `user_quiz_completions`
- Il sistema non riproporrà mai lo stesso quiz ID all'utente

### 2️⃣ **Dopo aver passato almeno UN quiz, l'utente può scrivere recensioni**
- Il pulsante cambia da "🎯 Fai il Quiz" a "✍️ Scrivi Recensione"
- La recensione sarà marcata come "Verificata"
- L'utente mantiene questo privilegio per sempre su quel contenuto

### 3️⃣ **Sistema di riutilizzo intelligente**
- I quiz vengono condivisi tra tutti gli utenti
- Nuovi quiz vengono generati SOLO quando necessario
- Ottimizzazione massima delle chiamate AI

## 🔄 Scenari e Comportamenti

### Scenario A: Prima Volta
```
Utente → Clicca "Fai il Quiz" → Prima volta su questo film
↓
Sistema cerca quiz disponibili per l'utente
↓
Caso 1: Non esistono quiz per questo film
→ Genera NUOVO quiz con AI (30-60 secondi)
→ Salva quiz nel database
→ Propone quiz all'utente

Caso 2: Esistono quiz che l'utente NON ha mai fatto
→ Seleziona uno di questi quiz (500ms)
→ Propone quiz all'utente
```

### Scenario B: Quiz Fallito
```
Utente → Fallisce il quiz (< 50 punti) → Clicca "Prova Quiz Diverso"
↓
Il quiz fallito viene registrato in user_quiz_completions
↓
Sistema cerca ALTRI quiz disponibili
↓
Caso 1: Esistono altri quiz non fatti
→ Propone un quiz DIVERSO

Caso 2: L'utente ha fatto tutti i quiz esistenti
→ Genera NUOVO quiz con AI
→ Badge "🎆 Quiz esclusivo creato per te!"

Caso 3: Era l'unico quiz disponibile e l'utente l'ha fallito
→ Genera NUOVO quiz (non può rifare lo stesso)
```

### Scenario C: Quiz Passato
```
Utente → Passa il quiz (≥ 50 punti)
↓
Quiz registrato come PASSATO in user_quiz_completions
↓
Pulsante cambia in "✍️ Scrivi Recensione" (Verde con badge "Verificata")
↓
Se clicca di nuovo il quiz (per curiosità)
→ Riceve un quiz DIVERSO o nuovo (mai lo stesso)
```

### Scenario D: Ritorno sulla pagina
```
Utente → Torna sulla pagina del film dopo giorni
↓
Sistema verifica in user_quiz_completions
↓
Ha passato almeno un quiz?
→ SÌ: Mostra "✍️ Scrivi Recensione"
→ NO: Mostra "🎯 Fai il Quiz"
    ↓
    Se clicca quiz: propone quiz che NON ha mai fatto
```

## 📊 Esempi Pratici

### Esempio 1: Mario su "Inception"
```
Tentativo 1: Quiz A → Fallisce (45/80)
→ Quiz A registrato come fallito
→ Clicca "Prova Quiz Diverso"

Tentativo 2: Quiz B (nuovo o esistente) → Fallisce (40/80)
→ Quiz B registrato come fallito
→ Clicca "Prova Quiz Diverso"

Tentativo 3: Quiz C (generato perché ha fatto A e B) → Passa (65/80)
→ Quiz C registrato come passato
→ Pulsante diventa "✍️ Scrivi Recensione"
→ NON potrà mai più rifare Quiz A, B o C
```

### Esempio 2: Team di amici
```
Alice: Primo utente → Genera Quiz A → Passa
Bob: Secondo utente → Riutilizza Quiz A → Fallisce
Charlie: Terzo utente → Riutilizza Quiz A → Passa
David: Quarto utente → Riutilizza Quiz A → Fallisce → Prova Quiz B (nuovo)

Risultato:
- 1 sola generazione AI iniziale
- 3 riutilizzi del quiz esistente
- 1 nuova generazione solo quando necessario
```

## 💾 Struttura Database

### `user_quiz_completions`
```sql
user_id    | quiz_id | passed | completed_at
-----------|---------|--------|-------------
mario-123  | quiz-A  | false  | 2024-01-01
mario-123  | quiz-B  | false  | 2024-01-01
mario-123  | quiz-C  | true   | 2024-01-02
alice-456  | quiz-A  | true   | 2024-01-01
```

### Constraint Importante
```sql
UNIQUE(user_id, quiz_id) -- Impedisce duplicati
```

## 🎨 UI/UX

### Stati del Pulsante

1. **"🎯 Fai il Quiz"** (Bianco)
   - Utente non ha mai passato un quiz
   - Può ancora provare quiz diversi

2. **"✍️ Scrivi Recensione"** (Verde gradiente + Badge "Verificata")
   - Utente ha passato almeno un quiz
   - Può scrivere recensione verificata

### Messaggi Durante il Caricamento

- **Quiz Riutilizzato**: "Caricamento quiz..." / "Recupero quiz esistente dal database"
- **Nuovo Quiz**: "Generazione quiz in corso..." / "Stiamo preparando le domande per te"
- **Quiz Esclusivo**: "Creazione di un nuovo quiz personalizzato per te"

### Messaggi nei Risultati

- **Quiz Passato**: 
  - "🎉 Quiz Superato!"
  - Pulsante: "Prova Altro Quiz"
  
- **Quiz Fallito**:
  - "😔 Quiz Non Superato"
  - Pulsante: "Prova Quiz Diverso"
  
- **Quiz Esclusivo** (se generato appositamente):
  - Badge: "🎆 Quiz esclusivo creato per te!"

## 🔍 Verifica Tecnica

### Endpoint `/api/quiz/check-status`
```javascript
// Verifica se l'utente ha passato almeno un quiz
GET /api/quiz/check-status?tmdb_id=27205&type=movie

Response:
{
  hasPassed: true/false,
  canRetryQuiz: true/false,
  message: "L'utente ha superato almeno un quiz"
}
```

### Endpoint `/api/quiz/generate`
```javascript
// Sistema intelligente che:
// 1. Cerca quiz non fatti dall'utente
// 2. Riutilizza se disponibili
// 3. Genera nuovo solo se necessario

POST /api/quiz/generate
{
  user_id: "abc-123",
  tmdb_id: 27205,
  content_type: "movie"
}

Response:
{
  quiz_id: "xyz-789",
  reused: true/false,
  generation_reason: "all_quizzes_completed" | "no_quiz_exists",
  quiz: { ... }
}
```

## ✅ Vantaggi del Sistema

1. **Equità**: Ogni tentativo è con un quiz diverso
2. **Ottimizzazione**: ~90% riduzione chiamate AI
3. **Gamification**: Badge "quiz esclusivo" quando necessario
4. **Progressione**: Sblocco recensioni verificate
5. **Varietà**: Contenuto sempre nuovo per l'utente

## 🚫 Cosa NON È Possibile

- ❌ Rifare lo stesso quiz (anche se fallito)
- ❌ Scegliere quale quiz fare
- ❌ Vedere i quiz già fatti
- ❌ Fare quiz dopo aver già scritto una recensione (non necessario)

## 📝 Note per Sviluppatori

1. Il sistema registra SEMPRE il completamento in `user_quiz_completions` (pass o fail)
2. La funzione `get_available_quizzes_for_user()` esclude automaticamente quiz già fatti
3. Il constraint UNIQUE su `(user_id, quiz_id)` previene duplicati a livello database
4. I quiz vengono generati con `generation_reason` per tracking

---

**Versione**: 2.0
**Data**: 15 Ottobre 2025
**Sistema**: Cinecheck Quiz Intelligence
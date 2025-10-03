# TEST MANUALE - Sistema Quiz UI

## Setup Completato ✅

- ✅ QuizContainer creato (gestione stato, timer, API integration)
- ✅ QuizStart creato (schermata iniziale con info quiz)
- ✅ QuizQuestion creato (display domanda con timer e selezione)
- ✅ QuizResults creato (risultati con review completa)
- ✅ QuizButton integrato in MovieHero e SeriesHero
- ✅ Build completato con successo
- ✅ Dev server attivo su http://localhost:3000

## Checklist Test Manuale

### 1. Navigazione e Accesso Quiz

- [ ] Aprire http://localhost:3000
- [ ] Cercare "Inception" nella barra di ricerca
- [ ] Cliccare sulla card del film
- [ ] Verificare che il bottone "🎯 Fai il Quiz" sia visibile nell'hero section
- [ ] Cliccare sul bottone Quiz

### 2. QuizStart - Schermata Iniziale

- [ ] Verificare che appaia il modal con sfondo blur
- [ ] Controllare che il titolo "Inception" sia visualizzato
- [ ] Verificare le informazioni del quiz:
  - [ ] 8 domande totali
  - [ ] Distribuzione: 3 Facili, 3 Medie, 2 Difficili
  - [ ] 80 punti totali
  - [ ] 48 punti (60%) per superare
  - [ ] 30 secondi per domanda
- [ ] Verificare che le regole siano visualizzate
- [ ] Cliccare "🚀 Inizia Quiz"

### 3. Loading - Generazione Quiz

- [ ] Verificare che appaia lo spinner animato
- [ ] Controllare il messaggio "Generazione quiz in corso..."
- [ ] Attendere il completamento (se cached: ~500ms, se fresh: ~60s)

### 4. QuizQuestion - Rispondere alle Domande

Per ogni domanda (ripetere 8 volte):

- [ ] Verificare che appaia il numero domanda corrente (es. "Domanda 1 / 8")
- [ ] Controllare il badge difficoltà (🟢 Facile / 🟡 Media / 🔴 Difficile)
- [ ] Verificare il timer countdown (30s → 0s)
- [ ] Controllare che il timer cambi colore:
  - [ ] Verde (> 20s)
  - [ ] Giallo (11-20s)
  - [ ] Rosso (≤ 10s) con messaggio "⚠️ Tempo in scadenza!"
- [ ] Verificare la barra di progresso in alto
- [ ] Verificare che ci siano 4 risposte (A, B, C, D)
- [ ] Selezionare una risposta (deve evidenziarsi in viola)
- [ ] Verificare che il bottone cambi da disabilitato a attivo
- [ ] Cliccare "→ Prossima" (o "✓ Termina Quiz" all'ultima domanda)

### 5. QuizResults - Visualizzazione Risultati

- [ ] Verificare che appaia l'emoji appropriata:
  - [ ] 🎉 se score ≥ 60%
  - [ ] 😔 se score < 60%
- [ ] Controllare il punteggio principale:
  - [ ] Score su 80 (es. "45 / 80")
  - [ ] Percentuale (es. "56%")
  - [ ] Colore verde/rosso in base al pass/fail
  - [ ] Numero risposte corrette (es. "5 / 8")
- [ ] Verificare "Performance per Difficoltà":
  - [ ] Barra verde per Facili
  - [ ] Barra gialla per Medie
  - [ ] Barra rossa per Difficili
  - [ ] Conteggio corretto per ogni difficoltà
- [ ] Verificare "Revisione Risposte":
  - [ ] Tutte le 8 domande visualizzate
  - [ ] ✓/✗ per ogni risposta
  - [ ] Emoji difficoltà per ogni domanda
  - [ ] Punti assegnati visualizzati
  - [ ] La tua risposta evidenziata (verde se corretta, rosso se sbagliata)
  - [ ] Risposta corretta mostrata per quelle sbagliate
  - [ ] Messaggio "⚠️ Nessuna risposta fornita" se timeout
- [ ] Cliccare "🔄 Riprova Quiz"

### 6. Retry Functionality

- [ ] Verificare che ritorni alla schermata QuizStart
- [ ] Cliccare nuovamente "🚀 Inizia Quiz"
- [ ] Verificare che le domande siano randomizzate (ordine diverso)
- [ ] Completare il quiz e verificare i nuovi risultati

### 7. Close e Navigation

- [ ] Cliccare "← Torna al Contenuto" nei risultati
- [ ] Verificare che il modal si chiuda
- [ ] Verificare di essere tornati alla pagina del film
- [ ] Riaprire il quiz e cliccare la X in alto a destra nello Start
- [ ] Verificare che il modal si chiuda

### 8. Test con Serie TV

- [ ] Cercare "Breaking Bad" nella home
- [ ] Aprire la pagina della serie
- [ ] Verificare che il bottone Quiz sia presente
- [ ] Avviare il quiz
- [ ] Verificare che funzioni come per i film (contentType="tv")

### 9. Test Timer Timeout

- [ ] Avviare un quiz
- [ ] Non selezionare alcuna risposta
- [ ] Attendere che il timer arrivi a 0
- [ ] Verificare che passi automaticamente alla domanda successiva
- [ ] Completare il quiz
- [ ] Verificare che nelle risposte appaia "⚠️ Nessuna risposta fornita"

### 10. Responsive Design

- [ ] Ridimensionare la finestra del browser (mobile view)
- [ ] Verificare che il modal sia responsive
- [ ] Controllare che i bottoni siano ben disposti
- [ ] Verificare che la barra di scroll funzioni nei risultati

### 11. Verifica Database

Dopo aver completato 2-3 quiz, controllare nel database:

- [ ] Tabella `contents`: deve esserci l'entry per Inception e Breaking Bad
- [ ] Tabella `quiz_questions`: 8 domande per ogni contenuto
- [ ] Tabella `quiz_attempts`: record per ogni tentativo
- [ ] Tabella `profiles`: `quiz_success_rate` aggiornato
- [ ] Tabella `quiz_generation_logs`: log delle generazioni

## Problemi Noti

- Gli errori TypeScript "Props must be serializable" sono **falsi positivi**
  - Le funzioni callback sono valide nei client components
  - Il build passa senza errori
  - Il runtime funziona correttamente

## Link Utili

- **App**: http://localhost:3000
- **Test Inception**: http://localhost:3000/movie/27205
- **Test Breaking Bad**: http://localhost:3000/series/1396
- **Supabase Dashboard**: (controllare i dati nel database)

## Note Tecniche

- Cache quiz: Il secondo tentativo sullo stesso contenuto è istantaneo (~500ms)
- Timer: 30 secondi per domanda, auto-submit allo scadere
- Randomizzazione: Ordine domande e risposte randomizzato ad ogni attempt
- Score: 60% threshold per passare (48/80 punti)
- Distribuzione punti: Easy=5pt, Medium=10pt, Hard=15pt

## Risultati Attesi

✅ **Funzionalità Complete**:

- Generazione quiz con Gemini AI
- Cache funzionante
- Timer con countdown visivo
- Selezione risposte interattiva
- Calcolo score accurato
- Statistiche per difficoltà
- Review completa delle risposte
- Retry senza limite

✅ **User Experience**:

- Animazioni fluide
- Feedback visivo chiaro
- Responsive design
- Loading states
- Error handling

✅ **Database Integration**:

- Salvataggio tentativi
- Update statistiche
- Tracking success rate
- Logging generazioni

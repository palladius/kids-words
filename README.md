# 🔤 Kids Words (*Parole in Fuga — Edizione Bimbi*)

Gioco educativo di anagrammi a scorrimento continuo (*swipe puzzle*) con **esaurimento progressivo delle tessere ($D(r,c)$)** per **Alessandro (8 anni, P3)** e **Sebastian (6 anni, P1)**.

## ✨ Caratteristiche Principali
- **Meccanica Shrink ($D(r,c)$)**: Ogni tessera mostra quante parole residue la usano. Quando scende a `0`, esplode e scompare, lasciando per l'ultima parola esattamente le sue lettere.
- **Cutie Back-View Reveal**: Sfondi illustrati con Ale (felpa rossa + Ghigna 🐉) e Seby (felpa blu 🏎️) visti di spalle che si svelano man mano che la griglia si svuota.
- **Due Tier per Età**:
  - **Seby (6a · 3×3)**: 3 parole corte (3–5 lettere).
  - **Ale (8a · 4×4)**: 4 parole medie (4–6 lettere).
- **Spiegazione Parole Ostiche (`B1+`)**: Parole non-A1/A2 (es. `ARNIA`, `AIA`, `ORMA`, `SEPPIA`, `ASTRO`, `ELMO`) mostrano subito un **fumetto illustrato** + spiegazione parlata `gemini-3.8-flash-tts`.

## 🚀 Quickstart
```bash
npm test          # Esegue la suite TDD (3/3 pass)
npm run build     # Rigenera public/index.html self-contained
npm run tts       # Pre-genera i file audio .wav con gemini-3.8-flash-tts ($0 Free Tier)
```

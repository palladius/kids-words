#!/usr/bin/env python3
"""
Adversarial Lexicon Verifier & Level Enricher for Kids Words.
Uses LibreOffice it_IT Hunspell dictionary (via spylls) + Italian Zipf frequencies (wordfreq) to:
1. Enumerate 100% of valid Italian words (3..6/7 letters) reachable by orthogonal swipe on every grid.
2. Select NATURAL, everyday Italian target words first (ranked by real Italian Zipf frequency,
   with balanced length quotas for 3L / 4L / 5L / 6L+), while keeping obscure/archaic inflections
   and rare words in `bonus_words` (Biscottiera Segreta)!
3. Export data/it_grid_lexicon.json as the ground-truth lexicon for unit tests (Phase 6).
"""
import json
import urllib.request
from pathlib import Path

from spylls.hunspell import Dictionary
from wordfreq import zipf_frequency

ROOT = Path(__file__).resolve().parent.parent
CACHE_DIR = Path("/tmp/kids-words-hunspell")
CACHE_DIR.mkdir(parents=True, exist_ok=True)

DIC_PATH = CACHE_DIR / "it_IT.dic"
AFF_PATH = CACHE_DIR / "it_IT.aff"

if not DIC_PATH.exists():
    urllib.request.urlretrieve(
        "https://raw.githubusercontent.com/LibreOffice/dictionaries/master/it_IT/it_IT.dic",
        DIC_PATH,
    )
if not AFF_PATH.exists():
    urllib.request.urlretrieve(
        "https://raw.githubusercontent.com/LibreOffice/dictionaries/master/it_IT/it_IT.aff",
        AFF_PATH,
    )

CURATED_META = {
    # Base A1/A2 everyday words
    "APE": ("A1", "🐝", None),
    "PANE": ("A1", "🥖", None),
    "RANA": ("A1", "🐸", None),
    "RANE": ("A1", "🐸", None),
    "CANE": ("A1", "🐶", None),
    "CANI": ("A1", "🐶", None),
    "MARE": ("A1", "🌊", None),
    "MARI": ("A1", "🌊", None),
    "SOLE": ("A1", "☀️", None),
    "SOLO": ("A1", "🧍", None),
    "SOLA": ("A1", "🧍", None),
    "ROSA": ("A1", "🌹", None),
    "ROSE": ("A1", "🌹", None),
    "RAMO": ("A1", "🌿", None),
    "RAMI": ("A1", "🌿", None),
    "PERA": ("A1", "🍐", None),
    "MELE": ("A1", "🍎", None),
    "MELO": ("A2", "🌳", None),
    "NAVE": ("A1", "🚢", None),
    "NAVI": ("A1", "🚢", None),
    "VELA": ("A2", "⛵", None),
    "VELE": ("A2", "⛵", None),
    "MANI": ("A1", "👐", None),
    "MANO": ("A1", "✋", None),
    "CASA": ("A1", "🏠", None),
    "CASE": ("A1", "🏘️", None),
    "CASO": ("A2", "🎲", None),
    "COSA": ("A1", "❓", None),
    "COSE": ("A1", "📦", None),
    "CENA": ("A1", "🍝", None),
    "CERA": ("A2", "🕯️", None),
    "NASO": ("A1", "👃", None),
    "NERA": ("A1", "⬛", None),
    "NERI": ("A1", "⬛", None),
    "NERO": ("A1", "⬛", None),
    "SERA": ("A1", "🌆", None),
    "ARIA": ("A1", "💨", None),
    "AMORE": ("A1", "💘", None),
    "AMICO": ("A1", "👦", None),
    "AMICA": ("A1", "👧", None),
    "AMACA": ("A2", "🏝️", None),
    "TRAM": ("A1", "🚋", None),
    "TREMA": ("A2", "🥶", None),
    "VELOCE": ("A1", "⚡", None),
    "COLORA": ("A1", "🎨", None),
    "COLORE": ("A1", "🎨", None),
    "COLORI": ("A1", "🌈", None),
    "LORO": ("A1", "👥", None),
    "COME": ("A1", "❓", None),
    "MALE": ("A1", "🤕", None),
    "TEMA": ("A2", "📝", None),
    "TALE": ("A2", "👉", None),
    "NATA": ("A1", "🐣", None),
    "NASCE": ("A1", "🌱", None),
    "NATALE": ("A1", "🎄", None),
    "RISATE": ("A1", "😂", None),
    "RISATA": ("A1", "😄", None),
    "SIRENA": ("A1", "🧜‍♀️", None),
    "LENTE": ("A2", "🔍", None),
    "CIMA": ("A2", "🏔️", None),
    "CORO": ("A2", "🎶", None),
    "CORI": ("A2", "🎶", None),
    "PACE": ("A2", "🕊️", None),
    "ORA": ("A1", "⏰", None),
    "ORE": ("A1", "⏰", None),
    "ORO": ("A1", "🪙", None),
    "TRE": ("A1", "3️⃣", None),
    "MAI": ("A1", "🙅", None),
    "AMO": ("A1", "❤️", None),
    "OCA": ("A1", "🪿", None),
    "CARO": ("A2", "💖", None),
    "CARE": ("A2", "💖", None),
    "CARA": ("A2", "💖", None),
    "RARO": ("A2", "💎", None),
    "RARA": ("A2", "💎", None),
    "SANA": ("A2", "💪", None),
    "SANE": ("A2", "💪", None),
    "ORSA": ("A2", "🐻", None),
    "ORSO": ("A1", "🐻", None),
    "STELLA": ("A1", "⭐", None),
    "STORIA": ("A1", "📖", None),
    "STORIE": ("A1", "📚", None),
    "PIANO": ("A1", "🎹", None),
    "MOTORI": ("A2", "🏎️", None),
    "MOTO": ("A1", "🏍️", None),
    "TRENO": ("A1", "🚂", None),
    "TRENI": ("A1", "🚆", None),
    "VOLO": ("A1", "✈️", None),
    "TORNA": ("A1", "↩️", None),
    "TORNO": ("A1", "↩️", None),
    "MONTA": ("A2", "🏔️", None),
    "COLLE": ("A2", "⛰️", None),
    "MORTO": ("A2", "💀", None),
    "CASTE": ("A2", "🏰", None),
    "ALONE": ("A2", "🌕", None),
    "ASILO": ("A1", "🏫", None),
    "ANIMO": ("A2", "🔥", None),
    "TIRO": ("A1", "🎯", None),
    "ARMA": ("A2", "⚔️", None),
    "PARI": ("A2", "⚖️", None),

    # Rich B1 / B2 / C1 vocabulary (kept clear & kid/family friendly)
    "ARNIA": ("B2", "🍯", "L'arnia è la casetta di legno dove vivono le api e preparano il miele!"),
    "AIA": ("B2", "🏡", "L'aia è il grande cortile davanti alla fattoria dove razzolano le galline!"),
    "ARA": ("B2", "🦜", "L'ara è un grande pappagallo tropicale dalle piume rosse, gialle e blu!"),
    "RAPA": ("B1", "🫜", "La rapa è una verdura tonda che cresce sottoterra nell'orto!"),
    "RAPE": ("B1", "🫜", "Le rape sono radici saporite che crescono nell'orto sotto terra!"),
    "PENA": ("B1", "🥺", "La pena è un piccolo dispiacere nel cuore quando qualcuno è triste."),
    "IRA": ("B2", "🌋", "L'ira è una rabbia fortissima e improvvisa, come un vulcano che sbuffa!"),
    "ERA": ("B1", "🦖", "Un'era è un tempo lunghissimo della storia, come l'era dei dinosauri!"),
    "RAMA": ("B2", "🌿", "La rama è un bel ramo pieno di foglie verdi sugli alberi del bosco!"),
    "RAME": ("B1", "🥉", "Il rame è un metallo rosso-dorato con cui si fanno fili elettrici e pentole!"),
    "REMA": ("B1", "🚣", "Rema vuol dire spingere la barca sull'acqua usando i remi di legno!"),
    "REMO": ("B1", "🚣", "Il remo è la pala di legno che fa avanzare le barche sull'acqua!"),
    "ARARE": ("B1", "🚜", "Arare vuol dire lavorare e solcare la terra dei campi per prepararla ai semi!"),
    "AROMA": ("B2", "☕", "L'aroma è il profumo delizioso dei biscotti caldi o delle spezie!"),
    "AROMI": ("B2", "🌿", "Gli aromi sono le erbe profumate come rosmarino e basilico!"),
    "MORA": ("B1", "🫐", "La mora è il frutto dolce e scuro che cresce sui rovi nei sentieri!"),
    "MORE": ("B1", "🫐", "Le more sono i frutti di bosco neri e dolcissimi dell'estate!"),
    "LEVA": ("B2", "🕹️", "La leva è un'asta speciale che permette di sollevare pesi enormi con poca fatica!"),
    "VELO": ("B1", "☁️", "Il velo è un tessuto leggerissimo e trasparente come una nuvola!"),
    "MOLO": ("B1", "⚓", "Il molo è la banchina sul mare dove attraccano le barche!"),
    "MOLE": ("B2", "🏛️", "La mole è la grandezza imponente di una montagna o di un palazzo gigante!"),
    "MIRA": ("B2", "🎯", "La mira è la precisione dell'occhio quando punti al centro del bersaglio!"),
    "RIMA": ("B1", "📜", "La rima è quando due parole finiscono con lo stesso suono, come cuore e fiore!"),
    "ARENA": ("B1", "🏟️", "L'arena è il grande anfiteatro antico o la distesa di sabbia dorata!"),
    "RENA": ("C1", "🏖️", "La rena è la sabbia finissima e dorata della riva del mare!"),
    "SOL": ("B1", "🎵", "Il Sol è la quinta nota della scala musicale (Do-Re-Mi-Fa-Sol-La-Si)!"),
    "SOMA": ("B2", "📦", "La soma è il carico portato a spalla o in groppa sui sentieri di montagna!"),
    "ASOLE": ("B2", "🪡", "Le asole sono i piccoli tagli cuciti sui vestiti dove si infilano i bottoni!"),
    "REMORA": ("C1", "🐟", "La remora è un curioso pesciolino marino che nuota attaccato alle tartarughe!"),
    "ELEVARE": ("B1", "🎈", "Elevare significa sollevare molto in alto verso il cielo!"),
    "ELEVA": ("B1", "🎈", "Eleva vuol dire solleva in alto come una mongolfiera!"),
    "LEVARE": ("B1", "🌅", "Levare significa sollevare, oppure il sorgere del sole all'alba!"),
    "TRAVE": ("B1", "🪵", "La trave è il grosso tronco di legno che sostiene il tetto delle case!"),
    "TRAVI": ("B1", "🪵", "Le travi sono le assi robuste che reggono i ponti e i tetti!"),
    "TRAME": ("B2", "🕸️", "Le trame sono i fili intrecciati o gli intrecci segreti delle storie!"),
    "VANI": ("B2", "🚪", "I vani sono le diverse stanze di una casa!"),
    "AMARENA": ("B1", "🍒", "L'amarena è una ciliegia scura e succosa dal gusto dolce e leggermente aspro!"),
    "RAPACE": ("B2", "🦅", "Un rapace è un uccello cacciatore dalla vista acutissima, come l'aquila o il falco!"),
    "MORENA": ("C1", "🏔️", "La morena è una collina di sassi trasportata lentamente da un ghiacciaio alpino!"),
    "ACERO": ("B2", "🍁", "L'acero è l'albero dalle foglie a cinque punte che in autunno diventano rosse!"),
    "ACERI": ("B2", "🍁", "Gli aceri sono gli alberi colorati d'autunno dalle foglie rosse e arancioni!"),
    "CERO": ("B2", "🕯️", "Il cero è una candela grande e solenne che illumina a lungo!"),
    "ROCA": ("C1", "🗣️", "Roca è una voce bassa e un po' graffiata, come quella di un drago assonnato!"),
    "RASO": ("B2", "🎀", "Il raso è un tessuto di seta liscissimo e lucente come uno specchio!"),
    "COMA": ("B2", "☄️", "In astronomia la coma è la chioma luminosa che avvolge la testa di una cometa!"),
    "ERICA": ("B2", "🌸", "L'erica è una piantina selvatica dai fiorellini viola che profuma i sentieri alpini!"),
    "AMOROSA": ("B1", "💕", "Amorosa significa piena di affetto, dolcezza e premura!"),
    "MOROSA": ("B2", "💖", "Nel Nord Italia 'morosa' vuol dire la fidanzata o compagna del cuore!"),
    "PERO": ("B1", "🌳", "Il pero è l'albero da frutto su cui crescono le pere dolci!"),
    "PARA": ("A2", "🧤", None),
    "PARE": ("B1", "🤔", "Pare significa 'sembra', quando qualcosa assomiglia a qualcos'altro!"),
    "ECO": ("B1", "🏔️", "L'eco è la voce della montagna che ti ripete le parole quando gridi!"),
    "COMETA": ("B1", "☄️", "La cometa è una palla di ghiaccio e polvere spaziale con una lunga coda luminosa!"),
    "CORONA": ("A2", "👑", None),
    "CORONE": ("A2", "👑", None),
    "CORALE": ("B2", "🎼", "Corale significa cantato insieme da tante voci in perfetta armonia!"),
    "MORALE": ("B2", "⚖️", "La morale è l'insegnamento prezioso nascosto alla fine di una favola!"),
    "ONESTI": ("B1", "🤝", "Onesti sono le persone sincere, giuste e leali che dicono la verità!"),
    "ONORE": ("B1", "🏅", "L'onore è il rispetto profondo conquistato agendo con coraggio e lealtà!"),
    "ROVINA": ("B1", "🏛️", "Le rovine sono i resti antichi di castelli, templi o città di secoli fa!"),
    "SERALE": ("B1", "🌆", "Serale indica tutto ciò che accade di sera, al tramonto o sotto le prime stelle!"),
    "TRENTA": ("A1", "3️⃣0️⃣", None),
    "ROMANI": ("A2", "🏛️", None),
    "ROTOLO": ("A2", "📜", None),
    "ORALE": ("B1", "🗣️", "Orale significa espresso a voce, parlando invece di scrivere!"),
}

ROMAN_OR_ACRONYM = {
    "III", "VII", "XII", "XVI", "CIA", "USA", "CEO", "SAS", "SIM",
    "PIN", "RAM", "ROM", "RAN", "AAA", "MMM", "CCC", "OOO", "EEE", "SSS"
}

# English loanwords / proper names / ultra-dry function words to keep out of main Targets (still valid in Bonus!)
SKIP_TARGET_WORDS = {
    "NEL", "TRA", "COL", "LEI", "STO", "MIA", "NON", "ALLE", "MAN", "ART", "SAN", "TAL",
    "TEAM", "TIME", "TIMER", "METAL", "SARA", "ELISA", "LISA", "ITALO", "EST", "SAI",
    "ERANO", "STIAMO", "STIANO", "STIA", "ORMAI", "AREE", "SOLITA", "SOLITE", "SOLI",
    "TALI", "ERO", "SON", "SOLERAI", "ARENAMI", "ROSELO", "PARANE", "CASARO", "LESOCI",
    "TEA", "TEE", "TOP", "EROS", "PAN", "PAR", "PER"
}

ADULT_LEVELS = [
    {
        "id": "it_adulto_001",
        "tier": "difficile",
        "theme": "🔭 La Cometa di Roma (3×5 · 30 Parole)",
        "scene_id": "zurich_stars",
        "scene_caption": "Ale, Seby e Papà osservano la cometa sopra il lago di Zurigo!",
        "grid": {
            "rows": 3,
            "cols": 5,
            "initial_letters": [
                ["T", "T", "E", "E", "A"],
                ["E", "R", "O", "N", "R"],
                ["A", "A", "M", "A", "R"],
            ],
        },
        "targets": [],
        "bonus_words": [],
    },
    {
        "id": "it_adulto_002",
        "tier": "difficile",
        "theme": "✨ Il Viale delle Stelle (4×4 · 30 Parole)",
        "scene_id": "alpine_sun",
        "scene_caption": "Sfida stellare ad alta coesione tra le vette svizzere!",
        "grid": {
            "rows": 4,
            "cols": 4,
            "initial_letters": [
                ["S", "P", "E", "L"],
                ["E", "O", "T", "A"],
                ["C", "E", "R", "I"],
                ["S", "S", "O", "V"],
            ],
        },
        "targets": [],
        "bonus_words": [],
    },
    {
        "id": "it_adulto_003",
        "tier": "difficile",
        "theme": "🏔️ L'Esame della Foresta (4×4 · 32 Parole)",
        "scene_id": "dragon_forest",
        "scene_caption": "La sfida finale 4×4 di Papà nella foresta magica!",
        "grid": {
            "rows": 4,
            "cols": 4,
            "initial_letters": [
                ["A", "B", "U", "B"],
                ["G", "A", "N", "I"],
                ["E", "S", "A", "M"],
                ["D", "I", "T", "O"],
            ],
        },
        "targets": [],
        "bonus_words": [],
    },
]

def all_paths_words(grid, max_len=6):
    rows, cols = len(grid), len(grid[0])
    paths = {}
    def dfs(r, c, path, w):
        if 3 <= len(w) <= max_len and w not in paths:
            paths[w] = list(path)
        if len(w) >= max_len:
            return
        for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in path:
                path.append((nr, nc))
                dfs(nr, nc, path, w + grid[nr][nc])
                path.pop()
    for r in range(rows):
        for c in range(cols):
            dfs(r, c, [(r, c)], grid[r][c])
    return paths

def word_quality(w):
    """Natural everyday Italian frequency (higher = more recognizable to players)."""
    z = zipf_frequency(w.lower(), "it")
    # Small boost for curated words with great child/family explanations, if actually common
    bonus = 0.55 if (w in CURATED_META and z >= 2.2) else 0.0
    return z + bonus

def main():
    d = Dictionary.from_files(str(CACHE_DIR / "it_IT"))
    levels_path = ROOT / "src" / "levels_it.mjs"
    raw = levels_path.read_text(encoding="utf-8")
    existing_levels = json.loads(raw[raw.index("["):raw.rindex("]") + 1])

    base_levels = [l for l in existing_levels if l.get("tier") not in ("difficile", "adulto")]
    for l in base_levels:
        if l["tier"] == "seby":
            l["tier"] = "facile"
        elif l["tier"] == "ale":
            l["tier"] = "medio"
    levels = base_levels + ADULT_LEVELS

    # Balanced target counts & natural length quotas per level
    # (3L, 4L, 5L, 6L+)
    quotas = {
        "it_seby_001": (3, 6, 1, 1),   # 11
        "it_seby_002": (4, 6, 2, 0),   # 12
        "it_seby_003": (5, 5, 5, 1),   # 16
        "it_ale_001":  (4, 10, 4, 2),  # 20
        "it_ale_002":  (5, 9, 5, 3),   # 22
        "it_ale_003":  (5, 11, 5, 3),  # 24
        "it_ale_004":  (5, 10, 6, 3),  # 24
        "it_adulto_001": (4, 10, 10, 6), # 30
        "it_adulto_002": (4, 10, 10, 6), # 30
        "it_adulto_003": (4, 10, 10, 8), # 32
    }

    lexicon_out = {}
    updated_levels = []

    for lvl in levels:
        lid = lvl["id"]
        grid = lvl["grid"]["initial_letters"]
        rows, cols = len(grid), len(grid[0])
        max_word_len = 7
        all_paths = all_paths_words(grid, max_len=max_word_len)

        valid_words = {}
        vowels = set("AEIOU")
        for w, p in all_paths.items():
            if w in ROMAN_OR_ACRONYM or not any(ch in vowels for ch in w):
                continue
            if d.lookup(w.lower()):
                valid_words[w] = p

        lexicon_out[lid] = sorted(valid_words.keys(), key=lambda x: (len(x), x))

        # Rank natural candidate words (exclude dry particles/English loanwords when picking targets)
        natural_pool = [
            w for w in valid_words
            if w not in SKIP_TARGET_WORDS and (word_quality(w) >= 2.1 or w in CURATED_META)
        ]

        q3, q4, q5, q6 = quotas.get(lid, (4, 9, 6, 5))
        target_n = q3 + q4 + q5 + q6
        len_limits = {3: q3, 4: q4, 5: q5, 6: q6}

        # Step 1: Greedy set cover to guarantee 100% D(r,c) >= 1, favoring natural high-frequency words!
        chosen = []
        covered = set()
        for _ in range(rows * cols):
            if len(covered) == rows * cols:
                break
            pool = [
                w for w in natural_pool
                if w not in chosen and len(set(map(tuple, valid_words[w])) - covered) > 0
            ] or [
                w for w in valid_words
                if w not in chosen and len(set(map(tuple, valid_words[w])) - covered) > 0
            ]
            best_w = max(
                pool,
                key=lambda w: (
                    len(set(map(tuple, valid_words[w])) - covered),
                    round(word_quality(w), 2),
                    1 if len(w) >= 4 else 0,
                ),
                default=None,
            )
            if best_w:
                chosen.append(best_w)
                covered.update(map(tuple, valid_words[best_w]))

        # Step 2: Fill remaining slots per length bucket using HIGHEST Italian Zipf frequency!
        def len_bucket(w):
            return 6 if len(w) >= 6 else len(w)

        for bucket in [6, 5, 4, 3]:
            cur_in_bucket = sum(1 for w in chosen if len_bucket(w) == bucket)
            candidates = sorted(
                [w for w in natural_pool if w not in chosen and len_bucket(w) == bucket],
                key=lambda w: (word_quality(w), w),
                reverse=True,
            )
            for w in candidates:
                if len(chosen) >= target_n or cur_in_bucket >= len_limits[bucket]:
                    break
                chosen.append(w)
                cur_in_bucket += 1

        # Top up if any bucket had fewer than its quota
        if len(chosen) < target_n:
            rest = sorted(
                [w for w in natural_pool if w not in chosen],
                key=lambda w: (word_quality(w), len(w), w),
                reverse=True,
            )
            for w in rest:
                if len(chosen) >= target_n:
                    break
                chosen.append(w)

        chosen.sort(key=lambda w: (len(w), w))
        chosen_set = set(chosen)
        bonus = sorted([w for w in valid_words if w not in chosen_set], key=lambda w: (len(w), w))

        targets = []
        for w in chosen:
            z = zipf_frequency(w.lower(), "it")
            if w in CURATED_META:
                cefr, emoji, expl = CURATED_META[w]
            else:
                cefr = "A1" if z >= 4.7 else ("A2" if z >= 3.8 else ("B1" if z >= 3.0 else "B2"))
                emoji = "✨"
                expl = None
            entry = {
                "word": w,
                "cefr": cefr,
                "emoji": emoji,
                "needs_explanation": expl is not None,
                "path": [list(p) for p in valid_words[w]],
            }
            if expl:
                entry["explanation_text"] = expl
            targets.append(entry)

        lvl["targets"] = targets
        lvl["bonus_words"] = bonus
        updated_levels.append(lvl)
        avg_z = sum(zipf_frequency(t["word"].lower(), "it") for t in targets) / len(targets)
        area = rows * cols
        tot_w = len(valid_words)
        common_w = [w for w in valid_words if w not in SKIP_TARGET_WORDS and zipf_frequency(w.lower(), "it") >= 3.2]
        common_hit = len(chosen_set & set(common_w)) / max(1, len(common_w))
        print(f"{lid:14s} [{lvl['tier']:9s}] ({rows}x{cols}={area:2d}): {len(targets):2d}/{tot_w:3d} ({tot_w/area:.2f} w/L, commonHit={common_hit*100:4.1f}%, avgZipf={avg_z:.2f}) · {[t['word'] for t in targets[:8]]}")

    (ROOT / "data").mkdir(parents=True, exist_ok=True)
    (ROOT / "data" / "it_grid_lexicon.json").write_text(
        json.dumps(lexicon_out, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    levels_path.write_text(
        "export const LEVELS_IT = " + json.dumps(updated_levels, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    print("Wrote data/it_grid_lexicon.json and updated src/levels_it.mjs")

if __name__ == "__main__":
    main()

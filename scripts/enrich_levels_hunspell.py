#!/usr/bin/env python3
"""
Adversarial Lexicon Verifier & Level Enricher for Kids Words.
Uses LibreOffice it_IT Hunspell dictionary (via spylls) to:
1. Enumerate 100% of valid Italian words (3..6/7 letters) reachable by orthogonal swipe on every grid.
2. Export data/it_grid_lexicon.json as the ground-truth lexicon for unit tests (Phase 6).
3. Populate every level's `bonus_words` (Treasure Trove / Biscottiera) with ALL valid Italian words
   not already in `targets`, ensuring no player can find a real Italian word that gets rejected!
"""
import json
import urllib.request
from pathlib import Path

from spylls.hunspell import Dictionary

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
    # Base A1/A2 words
    "APE": ("A1", "🐝", None),
    "PANE": ("A1", "🥖", None),
    "RANA": ("A1", "🐸", None),
    "RANE": ("A1", "🐸", None),
    "CANE": ("A1", "🐶", None),
    "MARE": ("A1", "🌊", None),
    "MARI": ("A1", "🌊", None),
    "SOLE": ("A1", "☀️", None),
    "SOLO": ("A1", "🧍", None),
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
    "CIMA": ("A2", "🏔️", None),
    "CORO": ("A2", "🎶", None),
    "CORI": ("A2", "🎶", None),
    "PACE": ("A2", "🕊️", None),
    "SARA": ("A2", "👧", None),
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
    "MONTA": ("A2", "🏔️", None),
    "COLLE": ("A2", "⛰️", None),
    "MORTO": ("A2", "💀", None),
    "CASTE": ("A2", "🏰", None),
    "ALONE": ("A2", "🌕", None),
    "ASILO": ("A1", "🏫", None),

    # Rich B1 / B2 / C1 vocabulary (including Adult Schemone words!)
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
    "CAROLA": ("C1", "💃", "La carola è un'antica danza in cerchio accompagnata dal canto popolare!"),
    "CAROLE": ("C1", "💃", "Le carole sono antiche danze medievali ballate tenendosi per mano in cerchio!"),
    "CASONE": ("B2", "🏚️", "Il casone è una grande casa rurale tipica delle campagne venete e padane!"),
    "MALORA": ("B2", "🌪️", "Andare in malora significa rovinarsi del tutto o finire in gran disordine!"),
    "AMENA": ("C1", "🌿", "Amena indica una località o una storia piacevole, serena e rilassante!"),
    "ANELA": ("C1", "✨", "Anela significa desidera con tutto il cuore di raggiungere un grande sogno!"),
    "ASOLA": ("B2", "🪡", "L'asola è il piccolo occhiello cucito nella stoffa per far passare il bottone!"),
    "ACORO": ("C1", "🪴", "L'acoro è una pianta acquatica profumata che cresce vicino ai laghi!"),
    "PIRATE": ("B1", "🏴‍☠️", "Le pirate sono coraggiose navigatrici dei mari a caccia di mappe e tesori!"),
    "ORMONE": ("B2", "🧬", "L'ormone è un messaggero chimico che coordina crescita ed energia nel corpo!"),
    "ONESTI": ("B1", "🤝", "Onesti sono le persone sincere, giuste e leali che dicono la verità!"),
    "ONORE": ("B1", "🏅", "L'onore è il rispetto profondo conquistato agendo con coraggio e lealtà!"),
    "OTARIA": ("B2", "🦭", "L'otaria è un mammifero marino agile e giocherellone simile alla foca!"),
    "EREMI": ("C1", "⛰️", "Gli eremi sono luoghi silenziosi e solitari in montagna dove trovare pace!"),
    "RESTIA": ("C1", "🐴", "Restia descrive chi esita o fatica a farsi convincere prima di fare qualcosa!"),
    "RETORE": ("C1", "🎙️", "Il retore era nell'antichità il maestro nell'arte di parlare in pubblico!"),
    "ASTORI": ("C1", "🦅", "Gli astori sono maestosi rapaci dei boschi dal volo rapido e silenzioso!"),
    "LAVINA": ("B2", "❄️", "La lavina è una grande massa di neve che scivola giù dai pendii alpini (valanga)!"),
    "MASTRO": ("B2", "🛠️", "Mastro è il titolo di un esperto artigiano o capobottega di grande abilità!"),
    "NIVALE": ("C1", "🌨️", "Nivale è tutto ciò che appartiene alla neve, al clima alpino e alle alte vette!"),
    "ROVINA": ("B1", "🏛️", "Le rovine sono i resti antichi di castelli, templi o città di secoli fa!"),
    "SERALE": ("B1", "🌆", "Serale indica tutto ciò che accade di sera, al tramonto o sotto le prime stelle!"),
    "STORNI": ("B2", "🐦", "Gli storni sono uccelli che volano in stormi acrobatici disegnando onde nel cielo!"),
    "STROMA": ("C1", "🔬", "In biologia lo stroma è la struttura di sostegno interna di organi e cloroplasti!"),
    "TORNIO": ("B2", "⚙️", "Il tornio è la macchina rotante che modella legno, ceramica o metallo!"),
    "TRENTA": ("A1", "3️⃣0️⃣", None),
    "ROMANI": ("A2", "🏛️", None),
    "ROTOLO": ("A2", "📜", None),
    "ASTRO": ("B2", "🌟", "Un astro è qualsiasi corpo celeste luminoso nel cielo, come stelle e pianeti!"),
    "NENIA": ("C1", "🎶", "La nenia è una melodia lenta e ripetitiva, come un'antica ninna nanna!"),
    "OVALE": ("A2", "🥚", None),
    "SARTO": ("B1", "🧵", "Il sarto è l'artigiano che taglia e cuce abiti su misura!"),
    "SCOLO": ("B2", "💧", "Lo scolo è il canale o condotto attraverso cui defluisce l'acqua piovana!"),
    "ORALE": ("B1", "🗣️", "Orale significa espresso a voce, parlando invece di scrivere!"),
    "AVOLO": ("C1", "👴", "Avolo è una parola antica e letteraria per indicare il nonno o un antenato!"),
}

ROMAN_OR_ACRONYM = {
    "III", "VII", "XII", "XVI", "CIA", "USA", "CEO", "SAS", "SIM",
    "PIN", "RAM", "ROM", "RAN", "AAA", "MMM", "CCC", "OOO", "EEE", "SSS"
}

ADULT_LEVELS = [
    {
        "id": "it_adulto_001",
        "tier": "difficile",
        "theme": "🔭 La Cometa del Castoro (5×5 · 26 Parole)",
        "scene_id": "zurich_stars",
        "scene_caption": "Ale, Seby e Papà osservano la cometa sopra i tetti di Zurigo!",
        "grid": {
            "rows": 5,
            "cols": 5,
            "initial_letters": [
                ["C", "A", "S", "T", "E"],
                ["O", "R", "O", "N", "A"],
                ["M", "A", "L", "E", "R"],
                ["E", "T", "I", "R", "O"],
                ["N", "A", "S", "C", "E"],
            ],
        },
        "targets": [],
        "bonus_words": [],
    },
    {
        "id": "it_adulto_002",
        "tier": "difficile",
        "theme": "✨ L'Osservatorio delle Stelle (5×6 · 28 Parole)",
        "scene_id": "alpine_sun",
        "scene_caption": "Sfida stellare tra le vette svizzere con Ghigna e Pupurabbu!",
        "grid": {
            "rows": 5,
            "cols": 6,
            "initial_letters": [
                ["S", "T", "E", "L", "L", "A"],
                ["P", "I", "A", "N", "O", "R"],
                ["A", "R", "M", "O", "N", "E"],
                ["T", "O", "R", "N", "A", "S"],
                ["E", "R", "E", "M", "I", "T"],
            ],
        },
        "targets": [],
        "bonus_words": [],
    },
    {
        "id": "it_adulto_003",
        "tier": "difficile",
        "theme": "🏔️ La Grande Storia Alpina (6×6 · Schemone Papà!)",
        "scene_id": "dragon_forest",
        "scene_caption": "Lo Schemone Finale 6×6 di Papà nella foresta magica!",
        "grid": {
            "rows": 6,
            "cols": 6,
            "initial_letters": [
                ["M", "O", "N", "T", "A", "R"],
                ["A", "R", "E", "N", "I", "O"],
                ["S", "T", "O", "R", "I", "A"],
                ["C", "O", "L", "L", "E", "R"],
                ["A", "M", "O", "R", "E", "S"],
                ["N", "I", "V", "A", "L", "E"],
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

def main():
    d = Dictionary.from_files(str(CACHE_DIR / "it_IT"))
    levels_path = ROOT / "src" / "levels_it.mjs"
    raw = levels_path.read_text(encoding="utf-8")
    existing_levels = json.loads(raw[raw.index("["):raw.rindex("]") + 1])

    # Keep the 7 facile/medio levels & replace any old difficile levels with our 3 adult schemoni
    base_levels = [l for l in existing_levels if l.get("tier") not in ("difficile", "adulto")]
    for l in base_levels:
        if l["tier"] == "seby":
            l["tier"] = "facile"
        elif l["tier"] == "ale":
            l["tier"] = "medio"
    levels = base_levels + ADULT_LEVELS

    desired_counts = {
        "it_seby_001": 11,
        "it_seby_002": 12,
        "it_seby_003": 16,
        "it_ale_001": 20,
        "it_ale_002": 22,
        "it_ale_003": 24,
        "it_ale_004": 24,
        "it_adulto_001": 26,
        "it_adulto_002": 28,
        "it_adulto_003": 32,
    }
    cefr_rank = {"C1": 5, "B2": 4, "B1": 3, "A2": 2, "A1": 1}

    lexicon_out = {}
    updated_levels = []

    for lvl in levels:
        lid = lvl["id"]
        grid = lvl["grid"]["initial_letters"]
        rows, cols = len(grid), len(grid[0])
        max_word_len = 6 if (rows * cols >= 25) else 7
        all_paths = all_paths_words(grid, max_len=max_word_len)

        valid_words = {}
        vowels = set("AEIOU")
        for w, p in all_paths.items():
            if w in ROMAN_OR_ACRONYM or not any(ch in vowels for ch in w):
                continue
            if d.lookup(w.lower()):
                valid_words[w] = p

        lexicon_out[lid] = sorted(valid_words.keys(), key=lambda x: (len(x), x))

        curated = [w for w in valid_words if w in CURATED_META]
        chosen = []
        covered = set()

        # Greedy set cover: always maximize newly covered cells across ALL valid_words (preferring curated on ties)
        for _ in range(rows * cols):
            if len(covered) == rows * cols:
                break
            pool = [w for w in valid_words if w not in chosen]
            best_w = max(
                pool,
                key=lambda w: (
                    len(set(map(tuple, valid_words[w])) - covered),
                    1 if w in CURATED_META else 0,
                    len(w),
                    cefr_rank.get(CURATED_META[w][0], 3) if w in CURATED_META else 2,
                ),
                default=None,
            )
            if best_w:
                chosen.append(best_w)
                covered.update(map(tuple, valid_words[best_w]))

        target_n = desired_counts.get(lid, 20)
        by_len = {
            6: sorted([w for w in curated if len(w) >= 6 and w not in chosen], key=lambda w: (len(w), cefr_rank[CURATED_META[w][0]], w), reverse=True),
            5: sorted([w for w in curated if len(w) == 5 and w not in chosen], key=lambda w: (cefr_rank[CURATED_META[w][0]], w), reverse=True),
            4: sorted([w for w in curated if len(w) == 4 and w not in chosen], key=lambda w: (cefr_rank[CURATED_META[w][0]], w), reverse=True),
            3: sorted([w for w in curated if len(w) == 3 and w not in chosen], key=lambda w: (cefr_rank[CURATED_META[w][0]], w), reverse=True),
        }
        # For adult tier prioritize 6L and 5L words!
        for w in by_len[6] + by_len[5]:
            if len(chosen) < target_n:
                chosen.append(w)
        added_3 = sum(1 for w in chosen if len(w) == 3)
        max_3 = 2 if lvl["tier"] == "difficile" else 5
        for w in by_len[3]:
            if len(chosen) >= target_n or added_3 >= max_3:
                break
            chosen.append(w)
            added_3 += 1
        for w in by_len[4] + by_len[3]:
            if len(chosen) >= target_n:
                break
            if w not in chosen:
                chosen.append(w)
        # Fallback to longest valid_words if curated pool ran dry
        if len(chosen) < target_n:
            extra_valid = sorted(
                [w for w in valid_words if w not in chosen and len(w) >= 5],
                key=lambda w: (-len(w), w),
            )
            for w in extra_valid:
                if len(chosen) >= target_n:
                    break
                chosen.append(w)

        chosen.sort(key=lambda w: (len(w), w))
        chosen_set = set(chosen)
        bonus = sorted([w for w in valid_words if w not in chosen_set], key=lambda w: (len(w), w))

        targets = []
        for w in chosen:
            cefr, emoji, expl = CURATED_META.get(w, ("B2", "✨", None))
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
        print(f"{lid} [{lvl['tier']}] ({rows}x{cols}): {len(targets)} targets + {len(bonus)} bonus = {len(targets)+len(bonus)} Hunspell words (cov={len(covered)}/{rows*cols})")

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

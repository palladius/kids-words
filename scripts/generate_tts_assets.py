#!/usr/bin/env python3
"""
Pre-generates static Italian TTS audio clips (.wav/.mp3) for Kids Words
using gemini-3.8-flash-tts ($0.00 Free Tier via GEMINI_API_KEY_FREE_TTS_STT).
"""
import os
import subprocess
import sys
from pathlib import Path

SKILL_SCRIPT = Path("/home/riccardo/.t3/userdata/providers/antigravity/ac0a3dfd6dddb20962cecff6ee5fe65e19d3923be20e52c5ab52ff877f7e4c32/antigravity-cli/skills/gemini-free-stt-tts/scripts/gemini_free_voice.py")
OUT_DIR = Path("/home/riccardo/git/kids-words/public/audio/it")

CLIPS = [
    ("ape.wav", "Ape!"),
    ("mia.wav", "Mia!"),
    ("arnia_explain.wav", "Arnia! <short pause> L'arnia è la casetta di legno dove vivono le api e preparano il miele!"),
    ("seppia_explain.wav", "Seppia! <short pause> La seppia è un animale marino simile al calamaro che spruzza inchiostro nero per nascondersi!"),
    ("complete_seby_001.wav", "Evviva Seby! <giggle> Hai scoperto tutte le parole: APE, ARNIA, MIA!"),
]

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for filename, text in CLIPS:
        out_path = OUT_DIR / filename
        if out_path.exists() and out_path.stat().st_size > 1000:
            print(f"[SKIP] {out_path} already exists")
            continue
        cmd = [
            sys.executable,
            str(SKILL_SCRIPT),
            "tts",
            text,
            "--voice", "Puck",
            "--style", "Warm, enthusiastic Italian elementary school teacher speaking clearly and joyfully to 6-year-old Seby and 8-year-old Ale",
            "-o", str(out_path),
        ]
        print(f"[TTS] Generating {filename}...")
        subprocess.run(cmd, check=False)

if __name__ == "__main__":
    main()

export const LEVELS_IT = [
  // =========================================================================
  // TIER SEBY (6 anni - P1): Griglia 3x3, 8-10 parole coese SOLO ORIZZ/VERT
  // =========================================================================
  {
    id: 'it_seby_001',
    language: 'it',
    tier: 'seby',
    theme: '🐝 Il Prato delle Api (8 Parole)',
    scene_id: 'bees_meadow',
    scene_caption: 'Ale e Seby nel prato fiorito con le api, l’arnia, Ghigna e Pupurabbu',
    grid: {
      rows: 3,
      cols: 3,
      initial_letters: [
        ['A', 'P', 'E'],
        ['R', 'A', 'N'],
        ['N', 'I', 'A']
      ]
    },
    targets: [
      { word: 'APE', cefr: 'A1', emoji: '🐝', needs_explanation: false, path: [[0,0],[0,1],[0,2]] },
      { word: 'PANE', cefr: 'A1', emoji: '🥖', needs_explanation: false, path: [[0,1],[1,1],[1,2],[0,2]] },
      { word: 'RANA', cefr: 'A1', emoji: '🐸', needs_explanation: false, path: [[1,0],[1,1],[1,2],[2,2]] },
      {
        word: 'ARNIA',
        cefr: 'B1+',
        emoji: '🍯',
        needs_explanation: true,
        explanation_text: "L'arnia è la casetta di legno dove vivono le api e preparano il miele!",
        path: [[0,0],[1,0],[2,0],[2,1],[2,2]]
      },
      {
        word: 'AIA',
        cefr: 'B1+',
        emoji: '🏡',
        needs_explanation: true,
        explanation_text: "L'aia è il grande cortile davanti alla fattoria dove razzolano le galline!",
        path: [[1,1],[2,1],[2,2]]
      },
      {
        word: 'ARA',
        cefr: 'B1+',
        emoji: '🦜',
        needs_explanation: true,
        explanation_text: "L'ara è un grande pappagallo coloratissimo con le piume rosse, gialle e blu!",
        path: [[0,0],[1,0],[1,1]]
      },
      {
        word: 'RAPA',
        cefr: 'B1+',
        emoji: '🫜',
        needs_explanation: true,
        explanation_text: "La rapa è una verdura tonda che cresce sottoterra nell'orto, come una grande carota viola!",
        path: [[1,0],[1,1],[0,1],[0,0]]
      },
      {
        word: 'PENA',
        cefr: 'B1+',
        emoji: '🥺',
        needs_explanation: true,
        explanation_text: "La pena è un piccolo dispiacere o tristezza nel cuore quando qualcuno è triste.",
        path: [[0,1],[0,2],[1,2],[1,1]]
      }
    ],
    bonus_words: ['ANA', 'PIA', 'IRA']
  },
  {
    id: 'it_seby_002',
    language: 'it',
    tier: 'seby',
    theme: '☀️ Sole e Mare (9 Parole)',
    scene_id: 'zurich_stars',
    scene_caption: 'Ale e Seby sul pontile del Lago di Zurigo con barca a vela, Ghigna e Pupurabbu',
    grid: {
      rows: 3,
      cols: 3,
      initial_letters: [
        ['S', 'O', 'L'],
        ['A', 'R', 'E'],
        ['M', 'A', 'I']
      ]
    },
    targets: [
      { word: 'SOLE', cefr: 'A1', emoji: '☀️', needs_explanation: false, path: [[0,0],[0,1],[0,2],[1,2]] },
      { word: 'MARE', cefr: 'A1', emoji: '🌊', needs_explanation: false, path: [[2,0],[2,1],[1,1],[1,2]] },
      { word: 'ROSA', cefr: 'A1', emoji: '🌹', needs_explanation: false, path: [[1,1],[0,1],[0,0],[1,0]] },
      {
        word: 'RAMA',
        cefr: 'B1+',
        emoji: '🌿',
        needs_explanation: true,
        explanation_text: "La rama è un ramo pieno di foglie verdi che cresce sugli alberi del bosco!",
        path: [[1,1],[1,0],[2,0],[2,1]]
      },
      { word: 'ORA', cefr: 'A1', emoji: '⏰', needs_explanation: false, path: [[0,1],[1,1],[1,0]] },
      { word: 'MAI', cefr: 'A1', emoji: '🙅', needs_explanation: false, path: [[2,0],[2,1],[2,2]] },
      {
        word: 'ERA',
        cefr: 'B1+',
        emoji: '🦖',
        needs_explanation: true,
        explanation_text: "Un'era è un tempo lunghissimo della storia, come l'era dei dinosauri!",
        path: [[1,2],[1,1],[1,0]]
      },
      { word: 'SARA', cefr: 'A2', emoji: '👧', needs_explanation: false, path: [[0,0],[1,0],[1,1],[2,1]] },
      {
        word: 'ARA',
        cefr: 'B1+',
        emoji: '🦜',
        needs_explanation: true,
        explanation_text: "L'ara è un grande pappagallo tropicale dalle piume rosse e blu!",
        path: [[1,0],[1,1],[2,1]]
      }
    ],
    bonus_words: ['AMO', 'ALI']
  },
  {
    id: 'it_seby_003',
    language: 'it',
    tier: 'seby',
    theme: '🐶 Amici Animali (10 Parole)',
    scene_id: 'dragon_forest',
    scene_caption: 'Ale e Seby nel bosco con il cagnolino, il pappagallo Ara, Ghigna e Pupurabbu',
    grid: {
      rows: 3,
      cols: 3,
      initial_letters: [
        ['C', 'A', 'N'],
        ['O', 'R', 'E'],
        ['M', 'A', 'I']
      ]
    },
    targets: [
      { word: 'CANE', cefr: 'A1', emoji: '🐶', needs_explanation: false, path: [[0,0],[0,1],[0,2],[1,2]] },
      { word: 'MARE', cefr: 'A1', emoji: '🌊', needs_explanation: false, path: [[2,0],[2,1],[1,1],[1,2]] },
      { word: 'OCA', cefr: 'A1', emoji: '🪿', needs_explanation: false, path: [[1,0],[0,0],[0,1]] },
      { word: 'RAMO', cefr: 'A1', emoji: '🪵', needs_explanation: false, path: [[1,1],[2,1],[2,0],[1,0]] },
      { word: 'CARO', cefr: 'A2', emoji: '💖', needs_explanation: false, path: [[0,0],[0,1],[1,1],[1,0]] },
      { word: 'AMO', cefr: 'A1', emoji: '❤️', needs_explanation: false, path: [[2,1],[2,0],[1,0]] },
      { word: 'ORA', cefr: 'A1', emoji: '⌚', needs_explanation: false, path: [[1,0],[1,1],[2,1]] },
      {
        word: 'ERA',
        cefr: 'B1+',
        emoji: '🦕',
        needs_explanation: true,
        explanation_text: "Un'era è un periodo grandissimo della preistoria, come quando c'erano i T-Rex!",
        path: [[1,2],[1,1],[2,1]]
      },
      {
        word: 'ARA',
        cefr: 'B1+',
        emoji: '🦜',
        needs_explanation: true,
        explanation_text: "L'ara è il pappagallo gigante della giungla che vola tra gli alberi!",
        path: [[0,1],[1,1],[2,1]]
      },
      { word: 'MAI', cefr: 'A1', emoji: '✨', needs_explanation: false, path: [[2,0],[2,1],[2,2]] }
    ],
    bonus_words: ['RE', 'MI']
  },

  // =========================================================================
  // TIER ALE (8 anni - P3): Griglia 4x4, 8-9 parole coese SOLO ORIZZ/VERT
  // =========================================================================
  {
    id: 'it_ale_001',
    language: 'it',
    tier: 'ale',
    theme: '🌊 L’Acquario Gigante (9 Parole)',
    scene_id: 'aquarium',
    scene_caption: 'Ale e Seby nel tunnel dell’acquario gigante con la seppia, la tartaruga, Ghigna e Pupurabbu',
    grid: {
      rows: 4,
      cols: 4,
      initial_letters: [
        ['M', 'A', 'R', 'E'],
        ['S', 'E', 'P', 'P'],
        ['V', 'E', 'L', 'I'],
        ['A', 'L', 'T', 'A']
      ]
    },
    targets: [
      { word: 'MARE', cefr: 'A1', emoji: '🌊', needs_explanation: false, path: [[0,0],[0,1],[0,2],[0,3]] },
      {
        word: 'SEPPIA',
        cefr: 'B1+',
        emoji: '🦑',
        needs_explanation: true,
        explanation_text: "La seppia è un animale marino simile al calamaro che spruzza inchiostro nero per nascondersi!",
        path: [[1,0],[1,1],[1,2],[1,3],[2,3],[3,3]]
      },
      { word: 'VELA', cefr: 'A2', emoji: '⛵', needs_explanation: false, path: [[2,0],[2,1],[3,1],[3,0]] },
      { word: 'ALTA', cefr: 'A1', emoji: '🦒', needs_explanation: false, path: [[3,0],[3,1],[3,2],[3,3]] },
      { word: 'PERA', cefr: 'A1', emoji: '🍐', needs_explanation: false, path: [[1,3],[0,3],[0,2],[0,1]] },
      {
        word: 'LEVA',
        cefr: 'B1+',
        emoji: '🕹️',
        needs_explanation: true,
        explanation_text: "La leva è un'asta o maniglia speciale che aiuta a sollevare pesi enormi con poca fatica!",
        path: [[2,2],[2,1],[2,0],[3,0]]
      },
      {
        word: 'ERA',
        cefr: 'B1+',
        emoji: '🦖',
        needs_explanation: true,
        explanation_text: "Un'era è un'epoca lunghissima della storia della Terra!",
        path: [[0,3],[0,2],[0,1]]
      },
      {
        word: 'PIA',
        cefr: 'B1+',
        emoji: '🕊️',
        needs_explanation: true,
        explanation_text: "Pia significa una persona molto buona, gentile e generosa con tutti!",
        path: [[1,3],[2,3],[3,3]]
      },
      { word: 'EVA', cefr: 'A2', emoji: '🍎', needs_explanation: false, path: [[2,1],[2,0],[3,0]] }
    ],
    bonus_words: ['RE', 'SE', 'LA']
  },
  {
    id: 'it_ale_002',
    language: 'it',
    tier: 'ale',
    theme: '🚀 Notte Stellata a Zurigo (9 Parole)',
    scene_id: 'zurich_stars',
    scene_caption: 'Ale e Seby sul pontile del Lago di Zurigo col cannocchiale sotto le stelle',
    grid: {
      rows: 4,
      cols: 4,
      initial_letters: [
        ['L', 'U', 'N', 'A'],
        ['A', 'S', 'T', 'R'],
        ['N', 'A', 'V', 'O'],
        ['C', 'I', 'E', 'L']
      ]
    },
    targets: [
      { word: 'LUNA', cefr: 'A1', emoji: '🌙', needs_explanation: false, path: [[0,0],[0,1],[0,2],[0,3]] },
      {
        word: 'ASTRO',
        cefr: 'B1+',
        emoji: '✨',
        needs_explanation: true,
        explanation_text: "Un astro è qualsiasi stella, pianeta o cometa che brilla nel cielo notturno!",
        path: [[1,0],[1,1],[1,2],[1,3],[2,3]]
      },
      { word: 'NAVE', cefr: 'A1', emoji: '🚢', needs_explanation: false, path: [[2,0],[2,1],[2,2],[3,2]] },
      { word: 'CIELO', cefr: 'A1', emoji: '🌌', needs_explanation: false, path: [[3,0],[3,1],[3,2],[3,3],[2,3]] },
      { word: 'LANA', cefr: 'A1', emoji: '🧶', needs_explanation: false, path: [[0,0],[1,0],[2,0],[2,1]] },
      { word: 'SANA', cefr: 'A2', emoji: '💪', needs_explanation: false, path: [[1,1],[1,0],[2,0],[2,1]] },
      {
        word: 'VELO',
        cefr: 'B1+',
        emoji: '👰',
        needs_explanation: true,
        explanation_text: "Il velo è un tessuto leggerissimo e trasparente come una nuvola!",
        path: [[2,2],[3,2],[3,3],[2,3]]
      },
      { word: 'ORA', cefr: 'A1', emoji: '⏰', needs_explanation: false, path: [[2,3],[1,3],[0,3]] },
      { word: 'UNA', cefr: 'A1', emoji: '1️⃣', needs_explanation: false, path: [[0,1],[0,2],[0,3]] }
    ],
    bonus_words: ['SU', 'NO', 'VA']
  },
  {
    id: 'it_ale_003',
    language: 'it',
    tier: 'ale',
    theme: '🐉 Il Bosco dei Draghi (8 Parole)',
    scene_id: 'dragon_forest',
    scene_caption: 'Ale, Seby, Ghigna e Pupurabbu nella radura magica del bosco',
    grid: {
      rows: 4,
      cols: 4,
      initial_letters: [
        ['T', 'A', 'N', 'A'],
        ['R', 'A', 'M', 'O'],
        ['E', 'L', 'M', 'O'],
        ['L', 'U', 'P', 'O']
      ]
    },
    targets: [
      { word: 'TANA', cefr: 'A2', emoji: '🦊', needs_explanation: false, path: [[0,0],[0,1],[0,2],[0,3]] },
      { word: 'RAMO', cefr: 'A1', emoji: '🌿', needs_explanation: false, path: [[1,0],[1,1],[1,2],[1,3]] },
      {
        word: 'ELMO',
        cefr: 'B1+',
        emoji: '🪖',
        needs_explanation: true,
        explanation_text: "L'elmo è il casco di metallo scintillante che indossavano i cavalieri per proteggere la testa!",
        path: [[2,0],[2,1],[2,2],[2,3]]
      },
      { word: 'LUPO', cefr: 'A1', emoji: '🐺', needs_explanation: false, path: [[3,0],[3,1],[3,2],[3,3]] },
      { word: 'MARE', cefr: 'A1', emoji: '🌊', needs_explanation: false, path: [[1,2],[1,1],[1,0],[2,0]] },
      { word: 'AMO', cefr: 'A1', emoji: '❤️', needs_explanation: false, path: [[1,1],[1,2],[1,3]] },
      { word: 'TRE', cefr: 'A1', emoji: '3️⃣', needs_explanation: false, path: [[0,0],[1,0],[2,0]] },
      {
        word: 'ERA',
        cefr: 'B1+',
        emoji: '⏳',
        needs_explanation: true,
        explanation_text: "Un'era è un lunghissimo periodo di tempo nella storia del mondo!",
        path: [[2,0],[1,0],[1,1]]
      }
    ],
    bonus_words: ['RE', 'TU', 'SU']
  }
];

export const LEVELS_IT = [
  // ==========================================
  // TIER SEBY (6 anni - P1): Griglia 3x3, 3 parole
  // ==========================================
  {
    id: 'it_seby_001',
    language: 'it',
    tier: 'seby',
    theme: '🐝 Il Prato delle Api',
    scene_id: 'meadow',
    scene_caption: 'Ale e Seby nel prato fiorito davanti all’alveare',
    grid: {
      rows: 3,
      cols: 3,
      initial_letters: [
        ['A', 'P', 'E'],
        ['R', 'N', 'I'],
        ['M', 'I', 'A']
      ]
    },
    targets: [
      {
        word: 'APE',
        cefr: 'A1',
        emoji: '🐝',
        needs_explanation: false,
        path: [[0,0], [0,1], [0,2]]
      },
      {
        word: 'ARNIA',
        cefr: 'B1+',
        emoji: '🍯',
        needs_explanation: true,
        explanation_text: "L'arnia è la casetta di legno dove vivono le api e preparano il miele!",
        path: [[0,0], [1,0], [1,1], [1,2], [2,2]]
      },
      {
        word: 'MIA',
        cefr: 'A1',
        emoji: '💛',
        needs_explanation: false,
        path: [[2,0], [2,1], [2,2]]
      }
    ],
    bonus_words: ['ERA', 'PIA', 'IRA', 'RANA', 'PANE']
  },
  {
    id: 'it_seby_002',
    language: 'it',
    tier: 'seby',
    theme: '🌾 La Fattoria del Nonno',
    scene_id: 'farm',
    scene_caption: 'Ale e Seby di spalle che guardano il fienile dorato',
    grid: {
      rows: 3,
      cols: 3,
      initial_letters: [
        ['O', 'C', 'A'],
        ['R', 'A', 'I'],
        ['B', 'U', 'E']
      ]
    },
    targets: [
      {
        word: 'OCA',
        cefr: 'A1',
        emoji: '🪿',
        needs_explanation: false,
        path: [[0,0], [0,1], [0,2]]
      },
      {
        word: 'BUE',
        cefr: 'A2',
        emoji: '🐂',
        needs_explanation: false,
        path: [[2,0], [2,1], [2,2]]
      },
      {
        word: 'AIA',
        cefr: 'B1+',
        emoji: '🏡',
        needs_explanation: true,
        explanation_text: "L'aia è il grande cortile davanti alla fattoria dove razzolano le galline e le oche!",
        path: [[0,2], [1,2], [1,1]]
      },
      {
        word: 'ORA',
        cefr: 'A1',
        emoji: '⏰',
        needs_explanation: false,
        path: [[0,0], [1,0], [1,1]]
      }
    ],
    bonus_words: ['CIAO', 'RIO', 'BAR', 'CIBO']
  },
  {
    id: 'it_seby_003',
    language: 'it',
    tier: 'seby',
    theme: '🏔️ Il Sentiero nelle Alpi',
    scene_id: 'alps',
    scene_caption: 'Ale e Seby con Ghigna sul sentiero sopra il Lago di Zurigo',
    grid: {
      rows: 3,
      cols: 3,
      initial_letters: [
        ['S', 'O', 'L'],
        ['R', 'M', 'E'],
        ['U', 'V', 'A']
      ]
    },
    targets: [
      {
        word: 'SOLE',
        cefr: 'A1',
        emoji: '☀️',
        needs_explanation: false,
        path: [[0,0], [0,1], [0,2], [1,2]]
      },
      {
        word: 'UVA',
        cefr: 'A1',
        emoji: '🍇',
        needs_explanation: false,
        path: [[2,0], [2,1], [2,2]]
      },
      {
        word: 'ORMA',
        cefr: 'B1+',
        emoji: '🐾',
        needs_explanation: true,
        explanation_text: "L'orma è l'impronta che lascia una zampa o uno scarpone sulla neve o nel fango!",
        path: [[0,1], [1,0], [1,1], [2,2]]
      }
    ],
    bonus_words: ['ORA', 'AMO', 'RE', 'MARE']
  },

  // ==========================================
  // TIER ALE (8 anni - P3): Griglia 4x4, 4 parole
  // ==========================================
  {
    id: 'it_ale_001',
    language: 'it',
    tier: 'ale',
    theme: '🌊 L’Acquario Gigante',
    scene_id: 'aquarium',
    scene_caption: 'Ale e Seby incantati davanti al grande vetro dell’acquario marino',
    grid: {
      rows: 4,
      cols: 4,
      initial_letters: [
        ['M', 'A', 'R', 'E'],
        ['S', 'E', 'P', 'P'],
        ['V', 'E', 'L', 'I'],
        ['R', 'E', 'T', 'A']
      ]
    },
    targets: [
      {
        word: 'MARE',
        cefr: 'A1',
        emoji: '🌊',
        needs_explanation: false,
        path: [[0,0], [0,1], [0,2], [0,3]]
      },
      {
        word: 'SEPPIA',
        cefr: 'B1+',
        emoji: '🦑',
        needs_explanation: true,
        explanation_text: "La seppia è un animale marino simile al calamaro che spruzza inchiostro nero per nascondersi!",
        path: [[1,0], [1,1], [1,2], [1,3], [2,3], [3,3]]
      },
      {
        word: 'VELA',
        cefr: 'A2',
        emoji: '⛵',
        needs_explanation: false,
        path: [[2,0], [2,1], [2,2], [3,3]]
      },
      {
        word: 'RETE',
        cefr: 'A2',
        emoji: '🥅',
        needs_explanation: false,
        path: [[3,0], [3,1], [3,2], [2,1]]
      }
    ],
    bonus_words: ['SALE', 'PERA', 'SERA', 'ARTE', 'RANA']
  },
  {
    id: 'it_ale_002',
    language: 'it',
    tier: 'ale',
    theme: '🚀 Notte Stellata a Zurigo',
    scene_id: 'zurich_night',
    scene_caption: 'Ale e Seby sul pontile del Lago di Zurigo sotto le costellazioni',
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
      {
        word: 'LUNA',
        cefr: 'A1',
        emoji: '🌙',
        needs_explanation: false,
        path: [[0,0], [0,1], [0,2], [0,3]]
      },
      {
        word: 'ASTRO',
        cefr: 'B1+',
        emoji: '✨',
        needs_explanation: true,
        explanation_text: "Un astro è qualsiasi stella, pianeta o cometa che brilla nel cielo notturno!",
        path: [[1,0], [1,1], [1,2], [1,3], [2,3]]
      },
      {
        word: 'NAVE',
        cefr: 'A1',
        emoji: '🚢',
        needs_explanation: false,
        path: [[2,0], [2,1], [2,2], [3,2]]
      },
      {
        word: 'CIELO',
        cefr: 'A1',
        emoji: '🌌',
        needs_explanation: false,
        path: [[3,0], [3,1], [3,2], [3,3], [2,3]]
      }
    ],
    bonus_words: ['SALI', 'VASO', 'SOLE', ' VELA']
  },
  {
    id: 'it_ale_003',
    language: 'it',
    tier: 'ale',
    theme: '🐉 Il Bosco dei Draghi',
    scene_id: 'dragon_woods',
    scene_caption: 'Ale, Seby e il draghetto Ghigna davanti alla quercia magica',
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
      {
        word: 'TANA',
        cefr: 'A2',
        emoji: '🦊',
        needs_explanation: false,
        path: [[0,0], [0,1], [0,2], [0,3]]
      },
      {
        word: 'RAMO',
        cefr: 'A1',
        emoji: '🌿',
        needs_explanation: false,
        path: [[1,0], [1,1], [1,2], [1,3]]
      },
      {
        word: 'ELMO',
        cefr: 'B1+',
        emoji: '🪖',
        needs_explanation: true,
        explanation_text: "L'elmo è il casco di metallo scintillante che indossavano i cavalieri per proteggere la testa!",
        path: [[2,0], [2,1], [2,2], [2,3]]
      },
      {
        word: 'LUPO',
        cefr: 'A1',
        emoji: '🐺',
        needs_explanation: false,
        path: [[3,0], [3,1], [3,2], [3,3]]
      }
    ],
    bonus_words: ['LUNA', 'MELA', 'ORMA', 'AMORE']
  }
];

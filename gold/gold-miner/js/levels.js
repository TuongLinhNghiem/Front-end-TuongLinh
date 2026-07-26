/* ============================================================
   levels.js - Round definitions and predefined layouts
   10 rounds, each with 3-5 manually-balanced predefined layouts.
   A layout is a list of object specs; controlled randomization picks
   among layout variants and applies small offsets.

   Object spec format:
   { t: "objectType", x, y, [move: bool], [moveSpeed], [moveDir], [range] }
   - range is the half-width of horizontal movement (minX = x-range, maxX = x+range)

   Coordinate system: canvas is 960x640.
   Player/claw anchor is near top (y ~ 70). Objects live in y range ~ 180..600.
   ============================================================ */

const LayoutManager = (function () {
  // Section themes: background color theme key per section
  const SECTION_THEMES = {
    1: { name: "The Old Mine",   bg: "mine",   rounds: [1,2,3] },
    2: { name: "The Lost Jungle", bg: "jungle", rounds: [4,5,6] },
    3: { name: "Ancient Ruins",  bg: "ruins",  rounds: [7,8,9] },
    4: { name: "The Golden Temple", bg: "temple", rounds: [10] }
  };

  function getSection(round) {
    for (const key in SECTION_THEMES) {
      if (SECTION_THEMES[key].rounds.includes(round)) return SECTION_THEMES[key];
    }
    return SECTION_THEMES[1];
  }

  // Helper to make object specs cleaner
  function o(t, x, y, extra) { return { t, x, y, ...(extra || {}) }; }

  // ===================== LAYOUTS =====================
  // Each entry is an array of object specs.
  // Layouts are designed so that a skilled player CAN reach 3 stars.

  const LAYOUTS = {
    // ---------- ROUND 1: Old Mine - basics ----------
    1: [
      [ // Layout A: simple spread
        o("smallGold", 200, 300),
        o("mediumGold", 480, 340),
        o("smallGold", 760, 300),
        o("largeGold", 340, 480),
        o("rock", 580, 480),
        o("mediumGold", 700, 540),
        o("smallGold", 150, 540),
        o("largeGold", 800, 200)
      ],
      [ // Layout B: central cluster
        o("mediumGold", 300, 300),
        o("smallGold", 500, 280),
        o("mediumGold", 660, 320),
        o("largeGold", 480, 460),
        o("rock", 240, 460),
        o("rock", 700, 460),
        o("smallGold", 400, 540),
        o("smallGold", 620, 540)
      ],
      [ // Layout C: sides
        o("largeGold", 200, 360),
        o("largeGold", 760, 360),
        o("mediumGold", 480, 300),
        o("smallGold", 360, 460),
        o("smallGold", 600, 460),
        o("rock", 480, 520),
        o("mediumGold", 300, 540),
        o("mediumGold", 660, 540)
      ]
    ],

    // ---------- ROUND 2: more rocks & large gold ----------
    2: [
      [
        o("largeGold", 200, 320),
        o("largeGold", 760, 320),
        o("mediumGold", 480, 300),
        o("rock", 360, 440),
        o("rock", 600, 440),
        o("smallGold", 240, 540),
        o("smallGold", 720, 540),
        o("mediumGold", 480, 540),
        o("largeGold", 480, 200)
      ],
      [
        o("mediumGold", 200, 280),
        o("largeGold", 480, 280),
        o("mediumGold", 760, 280),
        o("rock", 200, 460),
        o("rock", 760, 460),
        o("largeGold", 360, 520),
        o("largeGold", 600, 520),
        o("smallGold", 480, 460),
        o("rock", 480, 580)
      ],
      [
        o("largeGold", 300, 320),
        o("largeGold", 660, 320),
        o("mediumGold", 480, 240),
        o("rock", 200, 460),
        o("rock", 760, 460),
        o("mediumGold", 360, 540),
        o("mediumGold", 600, 540),
        o("largeGold", 480, 480),
        o("smallGold", 100, 360)
      ]
    ],

    // ---------- ROUND 3: mystery bags introduced ----------
    3: [
      [
        o("mediumGold", 200, 300),
        o("diamond", 480, 280),
        o("mediumGold", 760, 300),
        o("mysteryBag", 360, 440),
        o("mysteryBag", 600, 440),
        o("largeGold", 480, 520),
        o("rock", 240, 520),
        o("rock", 700, 520),
        o("smallGold", 480, 200),
        o("largeGold", 200, 220),
        o("largeGold", 760, 220)
      ],
      [
        o("diamond", 200, 300),
        o("mediumGold", 480, 280),
        o("diamond", 760, 300),
        o("mysteryBag", 480, 460),
        o("largeGold", 300, 520),
        o("largeGold", 660, 520),
        o("rock", 480, 580),
        o("smallGold", 360, 380),
        o("smallGold", 600, 380),
        o("largeGold", 200, 220),
        o("largeGold", 760, 220),
        o("mediumGold", 480, 200)
      ],
      [
        o("largeGold", 480, 260),
        o("mysteryBag", 200, 380, { move: true, range: 120 }),
        o("mysteryBag", 760, 380, { move: true, range: 120 }),
        o("diamond", 480, 440),
        o("rock", 300, 520),
        o("rock", 660, 520),
        o("mediumGold", 200, 560),
        o("mediumGold", 760, 560),
        o("largeGold", 200, 220),
        o("largeGold", 760, 220),
        o("diamond", 300, 460),
        o("diamond", 660, 460)
      ]
    ],

    // ---------- ROUND 4: moving diamonds ----------
    4: [
      [
        o("movingDiamond", 200, 320, { move: true, range: 140 }),
        o("movingDiamond", 760, 320, { move: true, range: 140 }),
        o("diamond", 480, 300),
        o("mediumGold", 360, 460),
        o("mediumGold", 600, 460),
        o("mysteryBag", 480, 540),
        o("largeGold", 200, 560),
        o("largeGold", 760, 560)
      ],
      [
        o("movingDiamond", 480, 280, { move: true, range: 200 }),
        o("diamond", 240, 420),
        o("diamond", 720, 420),
        o("mysteryBag", 360, 540),
        o("mysteryBag", 600, 540),
        o("largeGold", 480, 480),
        o("rock", 480, 580),
        o("mediumGold", 200, 320),
        o("mediumGold", 760, 320)
      ],
      [
        o("movingDiamond", 200, 360, { move: true, range: 120 }),
        o("movingDiamond", 760, 360, { move: true, range: 120 }),
        o("movingDiamond", 480, 300, { move: true, range: 180 }),
        o("diamond", 360, 500),
        o("diamond", 600, 500),
        o("mysteryBag", 480, 560),
        o("largeGold", 200, 560),
        o("largeGold", 760, 560)
      ]
    ],

    // ---------- ROUND 5: worms introduced ----------
    5: [
      [
        o("worm", 200, 360, { move: true, range: 140 }),
        o("worm", 760, 360, { move: true, range: 140 }),
        o("movingDiamond", 480, 300, { move: true, range: 180 }),
        o("diamond", 300, 480),
        o("diamond", 660, 480),
        o("mysteryBag", 480, 540),
        o("largeGold", 480, 200),
        o("largeGold", 200, 220),
        o("largeGold", 760, 220),
        o("rock", 480, 580)
      ],
      [
        o("worm", 480, 320, { move: true, range: 200 }),
        o("movingDiamond", 200, 400, { move: true, range: 120 }),
        o("movingDiamond", 760, 400, { move: true, range: 120 }),
        o("diamond", 480, 480),
        o("mysteryBag", 300, 540),
        o("mysteryBag", 660, 540),
        o("largeGold", 480, 560),
        o("largeGold", 200, 240),
        o("largeGold", 760, 240),
        o("mediumGold", 360, 460),
        o("mediumGold", 600, 460)
      ],
      [
        o("worm", 300, 380, { move: true, range: 160 }),
        o("worm", 660, 380, { move: true, range: 160 }),
        o("movingDiamond", 480, 280, { move: true, range: 220 }),
        o("diamond", 200, 480),
        o("diamond", 760, 480),
        o("mysteryBag", 480, 460),
        o("largeGold", 480, 560),
        o("largeGold", 200, 220),
        o("largeGold", 760, 220),
        o("rock", 360, 540),
        o("rock", 600, 540)
      ]
    ],

    // ---------- ROUND 6: more obstacles ----------
    6: [
      [
        o("worm", 200, 300, { move: true, range: 160 }),
        o("worm", 760, 300, { move: true, range: 160 }),
        o("worm", 480, 360, { move: true, range: 200 }),
        o("movingDiamond", 360, 460, { move: true, range: 120 }),
        o("movingDiamond", 600, 460, { move: true, range: 120 }),
        o("diamond", 480, 540),
        o("mysteryBag", 200, 540),
        o("mysteryBag", 760, 540),
        o("largeGold", 480, 220),
        o("largeGold", 200, 220),
        o("largeGold", 760, 220)
      ],
      [
        o("movingDiamond", 480, 280, { move: true, range: 240 }),
        o("worm", 200, 380, { move: true, range: 140 }),
        o("worm", 760, 380, { move: true, range: 140 }),
        o("diamond", 300, 480),
        o("diamond", 660, 480),
        o("mysteryBag", 480, 540),
        o("largeGold", 200, 540),
        o("largeGold", 760, 540),
        o("largeGold", 480, 220),
        o("mediumGold", 360, 440),
        o("mediumGold", 600, 440),
        o("rock", 480, 580)
      ],
      [
        o("worm", 480, 320, { move: true, range: 260 }),
        o("movingDiamond", 200, 400, { move: true, range: 120 }),
        o("movingDiamond", 760, 400, { move: true, range: 120 }),
        o("movingDiamond", 480, 460, { move: true, range: 180 }),
        o("diamond", 300, 540),
        o("diamond", 660, 540),
        o("mysteryBag", 480, 560),
        o("largeGold", 480, 220),
        o("largeGold", 200, 220),
        o("largeGold", 760, 220),
        o("mediumGold", 300, 460),
        o("mediumGold", 660, 460)
      ]
    ],

    // ---------- ROUND 7: faster moving, more worms ----------
    7: [
      [
        o("worm", 200, 300, { move: true, range: 160, moveSpeed: 120 }),
        o("worm", 760, 300, { move: true, range: 160, moveSpeed: 120 }),
        o("movingDiamond", 480, 320, { move: true, range: 240, moveSpeed: 150 }),
        o("movingDiamond", 300, 440, { move: true, range: 140, moveSpeed: 140 }),
        o("movingDiamond", 660, 440, { move: true, range: 140, moveSpeed: 140 }),
        o("diamond", 480, 540),
        o("mysteryBag", 200, 540),
        o("mysteryBag", 760, 540),
        o("largeGold", 480, 220),
        o("largeGold", 200, 220),
        o("largeGold", 760, 220),
        o("diamond", 300, 540),
        o("diamond", 660, 540)
      ],
      [
        o("worm", 300, 340, { move: true, range: 160, moveSpeed: 130 }),
        o("worm", 660, 340, { move: true, range: 160, moveSpeed: 130 }),
        o("movingDiamond", 480, 280, { move: true, range: 280, moveSpeed: 160 }),
        o("diamond", 200, 460),
        o("diamond", 760, 460),
        o("mysteryBag", 480, 460),
        o("largeGold", 200, 540),
        o("largeGold", 760, 540),
        o("largeGold", 480, 220),
        o("largeGold", 300, 220),
        o("largeGold", 660, 220),
        o("rock", 480, 580)
      ],
      [
        o("worm", 480, 300, { move: true, range: 280, moveSpeed: 140 }),
        o("movingDiamond", 200, 400, { move: true, range: 140, moveSpeed: 150 }),
        o("movingDiamond", 760, 400, { move: true, range: 140, moveSpeed: 150 }),
        o("movingDiamond", 480, 460, { move: true, range: 220, moveSpeed: 160 }),
        o("diamond", 300, 540),
        o("diamond", 660, 540),
        o("mysteryBag", 480, 560),
        o("largeGold", 480, 220),
        o("largeGold", 200, 220),
        o("largeGold", 760, 220),
        o("mediumGold", 300, 460),
        o("mediumGold", 660, 460)
      ]
    ],

    // ---------- ROUND 8: difficult placement, moving obstacles ----------
    8: [
      [
        o("worm", 200, 280, { move: true, range: 180, moveSpeed: 140 }),
        o("worm", 760, 280, { move: true, range: 180, moveSpeed: 140 }),
        o("worm", 480, 360, { move: true, range: 280, moveSpeed: 150 }),
        o("movingDiamond", 300, 460, { move: true, range: 160, moveSpeed: 160 }),
        o("movingDiamond", 660, 460, { move: true, range: 160, moveSpeed: 160 }),
        o("diamond", 480, 540),
        o("mysteryBag", 200, 540),
        o("mysteryBag", 760, 540),
        o("largeGold", 480, 220),
        o("largeGold", 200, 220),
        o("largeGold", 760, 220),
        o("diamond", 300, 540),
        o("diamond", 660, 540),
        o("rock", 480, 580)
      ],
      [
        o("movingDiamond", 480, 280, { move: true, range: 300, moveSpeed: 170 }),
        o("worm", 200, 380, { move: true, range: 160, moveSpeed: 150 }),
        o("worm", 760, 380, { move: true, range: 160, moveSpeed: 150 }),
        o("diamond", 300, 480),
        o("diamond", 660, 480),
        o("mysteryBag", 480, 540),
        o("largeGold", 200, 540),
        o("largeGold", 760, 540),
        o("largeGold", 480, 220),
        o("largeGold", 300, 220),
        o("largeGold", 660, 220),
        o("worm", 480, 460, { move: true, range: 200, moveSpeed: 130 })
      ],
      [
        o("worm", 300, 320, { move: true, range: 180, moveSpeed: 150 }),
        o("worm", 660, 320, { move: true, range: 180, moveSpeed: 150 }),
        o("movingDiamond", 480, 280, { move: true, range: 300, moveSpeed: 180 }),
        o("movingDiamond", 200, 440, { move: true, range: 140, moveSpeed: 160 }),
        o("movingDiamond", 760, 440, { move: true, range: 140, moveSpeed: 160 }),
        o("diamond", 480, 540),
        o("mysteryBag", 480, 460),
        o("largeGold", 480, 220),
        o("largeGold", 200, 220),
        o("largeGold", 760, 220),
        o("goldenTreasure", 300, 540),
        o("goldenTreasure", 660, 540)
      ]
    ],

    // ---------- ROUND 9: high-value in difficult positions, TNT/Leaf needed ----------
    9: [
      [
        o("worm", 200, 300, { move: true, range: 180, moveSpeed: 150 }),
        o("worm", 760, 300, { move: true, range: 180, moveSpeed: 150 }),
        o("rock", 480, 360),
        o("rock", 300, 460),
        o("rock", 660, 460),
        o("movingDiamond", 480, 460, { move: true, range: 220, moveSpeed: 170 }),
        o("diamond", 200, 540),
        o("diamond", 760, 540),
        o("goldenTreasure", 480, 540),
        o("mysteryBag", 480, 220),
        o("largeGold", 200, 220),
        o("largeGold", 760, 220),
        o("largeGold", 480, 200)
      ],
      [
        o("rock", 200, 320),
        o("rock", 760, 320),
        o("rock", 480, 380),
        o("movingDiamond", 300, 460, { move: true, range: 160, moveSpeed: 170 }),
        o("movingDiamond", 660, 460, { move: true, range: 160, moveSpeed: 170 }),
        o("diamond", 480, 520),
        o("goldenTreasure", 200, 540),
        o("goldenTreasure", 760, 540),
        o("mysteryBag", 480, 240),
        o("worm", 480, 300, { move: true, range: 240, moveSpeed: 140 }),
        o("largeGold", 200, 220),
        o("largeGold", 760, 220),
        o("largeGold", 480, 200)
      ],
      [
        o("worm", 480, 300, { move: true, range: 280, moveSpeed: 150 }),
        o("rock", 300, 400),
        o("rock", 660, 400),
        o("rock", 480, 460),
        o("movingDiamond", 200, 440, { move: true, range: 140, moveSpeed: 170 }),
        o("movingDiamond", 760, 440, { move: true, range: 140, moveSpeed: 170 }),
        o("goldenTreasure", 480, 540),
        o("diamond", 200, 540),
        o("diamond", 760, 540),
        o("mysteryBag", 480, 240),
        o("largeGold", 200, 220),
        o("largeGold", 760, 220),
        o("largeGold", 480, 200)
      ]
    ],

    // ---------- ROUND 10: FINAL - Golden Temple, all mechanics ----------
    10: [
      [
        o("worm", 200, 280, { move: true, range: 180, moveSpeed: 160 }),
        o("worm", 760, 280, { move: true, range: 180, moveSpeed: 160 }),
        o("rock", 480, 340),
        o("rock", 300, 440),
        o("rock", 660, 440),
        o("movingDiamond", 480, 420, { move: true, range: 280, moveSpeed: 180 }),
        o("mysteryBag", 200, 520, { move: true, range: 120, moveSpeed: 90 }),
        o("mysteryBag", 760, 520, { move: true, range: 120, moveSpeed: 90 }),
        o("goldenTreasure", 480, 540),
        o("diamond", 200, 540),
        o("diamond", 760, 540),
        o("largeGold", 480, 220),
        o("largeGold", 200, 220),
        o("largeGold", 760, 220),
        o("largeGold", 300, 540),
        o("largeGold", 660, 540)
      ],
      [
        o("worm", 480, 300, { move: true, range: 300, moveSpeed: 170 }),
        o("movingDiamond", 200, 380, { move: true, range: 140, moveSpeed: 180 }),
        o("movingDiamond", 760, 380, { move: true, range: 140, moveSpeed: 180 }),
        o("rock", 300, 460),
        o("rock", 660, 460),
        o("rock", 480, 520),
        o("goldenTreasure", 200, 540),
        o("goldenTreasure", 760, 540),
        o("diamond", 480, 460),
        o("mysteryBag", 480, 240),
        o("largeGold", 480, 220),
        o("largeGold", 200, 220),
        o("largeGold", 760, 220),
        o("largeGold", 300, 220),
        o("largeGold", 660, 220)
      ],
      [
        o("worm", 200, 320, { move: true, range: 180, moveSpeed: 160 }),
        o("worm", 760, 320, { move: true, range: 180, moveSpeed: 160 }),
        o("worm", 480, 380, { move: true, range: 280, moveSpeed: 160 }),
        o("movingDiamond", 300, 460, { move: true, range: 160, moveSpeed: 190 }),
        o("movingDiamond", 660, 460, { move: true, range: 160, moveSpeed: 190 }),
        o("rock", 480, 520),
        o("goldenTreasure", 480, 540),
        o("diamond", 200, 540),
        o("diamond", 760, 540),
        o("mysteryBag", 480, 240),
        o("largeGold", 480, 220),
        o("largeGold", 200, 220),
        o("largeGold", 760, 220),
        o("largeGold", 300, 540),
        o("largeGold", 660, 540)
      ]
    ]
  };

  // Round metadata: time limits
  const ROUND_META = {
    1:  { time: 60 },
    2:  { time: 60 },
    3:  { time: 60 },
    4:  { time: 60 },
    5:  { time: 55 },
    6:  { time: 55 },
    7:  { time: 55 },
    8:  { time: 55 },
    9:  { time: 60 },
    10: { time: 70 }
  };

  function getRoundTime(round) {
    return (ROUND_META[round] || ROUND_META[1]).time;
  }

  // Select a layout for a round with small controlled random variations.
  function buildLayout(round) {
    const layouts = LAYOUTS[round] || LAYOUTS[1];
    const idx = Math.floor(Math.random() * layouts.length);
    const chosen = layouts[idx];
    // Apply small controlled random variations:
    // - small x/y offset (so the same layout isn't pixel-identical each time)
    // - swap a small gold for medium gold occasionally in designated... (we keep simple here)
    const objects = chosen.map(spec => {
      const offX = (Math.random() - 0.5) * 16;
      const offY = (Math.random() - 0.5) * 10;
      const x = Math.max(40, Math.min(920, spec.x + offX));
      const y = Math.max(180, Math.min(600, spec.y + offY));
      return new GameObject(spec.t, x, y, {
        move: spec.move,
        moveSpeed: spec.moveSpeed ? spec.moveSpeed * (0.9 + Math.random() * 0.2) : undefined,
        moveDir: Math.random() < 0.5 ? -1 : 1,
        minX: spec.range ? x - spec.range : x - 100,
        maxX: spec.range ? x + spec.range : x + 100
      });
    });
    return objects;
  }

  return { LAYOUTS, getRoundTime, buildLayout, getSection, SECTION_THEMES };
})();

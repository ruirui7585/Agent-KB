'use strict';

// Labels stay as shown in the source screenshots. Matching uses structure()
// so that equivalent symbol arrangements can share a rule without rewriting
// the labels exposed to the prototype.
const CONFIG = Object.freeze([
  {
    "category": "C",
    "level": 25,
    "patterns": [
      "ABCDABC",
      "ABCABCD"
    ],
    "pending": false,
    "tableRows": [
      [
        "ABCDABC",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      [
        "ABCABCD",
        "",
        "",
        "",
        "",
        "",
        ""
      ]
    ]
  },
  {
    "category": "C",
    "level": 30,
    "patterns": [
      "ABCBBBB",
      "AABBAC",
      "AABBBAC",
      "ABABAD",
      "AABCCAA",
      "ABCABCA",
      "ABCCCAB",
      "ABACABA"
    ],
    "pending": false,
    "tableRows": [
      [
        "ABCBBBB",
        "AABBAC",
        "",
        "",
        "",
        "",
        ""
      ],
      [
        "AABBBAC",
        "ABABAD",
        "",
        "",
        "",
        "",
        ""
      ],
      [
        "AABCCAA",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      [
        "ABCABCA",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      [
        "ABCCCAB",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      [
        "ABACABA",
        "",
        "",
        "",
        "",
        "",
        ""
      ]
    ]
  },
  {
    "category": "C",
    "level": 35,
    "patterns": [
      "ABBCCA",
      "AABBBC",
      "AAAABC",
      "ABBBBC"
    ],
    "pending": false,
    "tableRows": [
      [
        "",
        "ABBCCA",
        "",
        "",
        "",
        "",
        ""
      ],
      [
        "",
        "AABBBC",
        "",
        "",
        "",
        "",
        ""
      ],
      [
        "",
        "AAAABC",
        "",
        "",
        "",
        "",
        ""
      ],
      [
        "",
        "ABBBBC",
        "",
        "",
        "",
        "",
        ""
      ]
    ]
  },
  {
    "category": "C",
    "level": 40,
    "patterns": [
      "AABBCC",
      "ABCAA",
      "ABCABC",
      "AABBC"
    ],
    "pending": false,
    "tableRows": [
      [
        "",
        "AABBCC",
        "ABCAA",
        "",
        "",
        "",
        ""
      ],
      [
        "",
        "ABCABC",
        "AABBC",
        "",
        "",
        "",
        ""
      ]
    ]
  },
  {
    "category": "B",
    "level": 45,
    "patterns": [
      "ABABAB",
      "AAABC",
      "AABBAA",
      "ABCCC",
      "AABBBB"
    ],
    "pending": false,
    "tableRows": [
      [
        "",
        "ABABAB",
        "AAABC",
        "",
        "",
        "",
        ""
      ],
      [
        "",
        "AABBAA",
        "ABCCC",
        "",
        "",
        "",
        ""
      ],
      [
        "",
        "AABBBB",
        "",
        "",
        "",
        "",
        ""
      ]
    ]
  },
  {
    "category": "B",
    "level": 50,
    "patterns": [
      "ABBBBB",
      "AABBA",
      "AAAAAB",
      "AAABA"
    ],
    "pending": false,
    "tableRows": [
      [
        "",
        "ABBBBB",
        "AABBA",
        "",
        "",
        "",
        ""
      ],
      [
        "",
        "AAAAAB",
        "AAABA",
        "",
        "",
        "",
        ""
      ]
    ]
  },
  {
    "category": "B",
    "level": 55,
    "patterns": [
      "AAABBB",
      "AAAAB",
      "AABBB",
      "AAABB"
    ],
    "pending": false,
    "tableRows": [
      [
        "",
        "AAABBB",
        "AAAAB",
        "",
        "",
        "",
        ""
      ],
      [
        "",
        "",
        "AABBB",
        "",
        "",
        "",
        ""
      ],
      [
        "",
        "",
        "AAABB",
        "",
        "",
        "",
        ""
      ]
    ]
  },
  {
    "category": "B",
    "level": 60,
    "patterns": [
      "AAAAAA",
      "AABAA",
      "ABAC",
      "ABCB",
      "ABCA"
    ],
    "pending": false,
    "tableRows": [
      [
        "",
        "AAAAAA",
        "AABAA",
        "ABAC",
        "",
        "",
        ""
      ],
      [
        "",
        "",
        "",
        "ABCB",
        "",
        "",
        ""
      ],
      [
        "",
        "",
        "",
        "ABCA",
        "",
        "",
        ""
      ]
    ]
  },
  {
    "category": "B",
    "level": 65,
    "patterns": [
      "ABBBB",
      "AABC",
      "ABBC",
      "ABCC"
    ],
    "pending": false,
    "tableRows": [
      [
        "",
        "",
        "ABBBB",
        "AABC",
        "",
        "",
        ""
      ],
      [
        "",
        "",
        "",
        "ABBC",
        "",
        "",
        ""
      ],
      [
        "",
        "",
        "",
        "ABCC",
        "",
        "",
        ""
      ]
    ]
  },
  {
    "category": "B",
    "level": 70,
    "patterns": [
      "AAAAA",
      "ABBA",
      "AABA"
    ],
    "pending": false,
    "tableRows": [
      [
        "",
        "",
        "AAAAA",
        "ABBA",
        "",
        "",
        ""
      ],
      [
        "",
        "",
        "",
        "AABA",
        "",
        "",
        ""
      ]
    ]
  },
  {
    "category": "B",
    "level": 75,
    "patterns": [
      "AABB",
      "ABAB"
    ],
    "pending": false,
    "tableRows": [
      [
        "",
        "",
        "",
        "AABB",
        "",
        "",
        ""
      ],
      [
        "",
        "",
        "",
        "ABAB",
        "",
        "",
        ""
      ]
    ]
  },
  {
    "category": "A",
    "level": 85,
    "patterns": [
      "AAAA",
      "ABB",
      "ABBB",
      "ABA"
    ],
    "pending": false,
    "tableRows": [
      [
        "",
        "",
        "",
        "AAAA",
        "ABB",
        "",
        ""
      ],
      [
        "",
        "",
        "",
        "ABBB",
        "ABA",
        "",
        ""
      ]
    ]
  },
  {
    "category": "A",
    "level": 95,
    "patterns": [
      "AAA",
      "AB",
      "AA"
    ],
    "pending": false,
    "tableRows": [
      [
        "",
        "",
        "",
        "",
        "AAA",
        "AB",
        ""
      ],
      [
        "",
        "",
        "",
        "",
        "",
        "AA",
        ""
      ]
    ]
  },
  {
    "category": "A",
    "level": 100,
    "patterns": [
      "A"
    ],
    "pending": false,
    "tableRows": [
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "A"
      ]
    ]
  }
]);
const SVIP_CONFIG = Object.freeze([
  { category: 'SS', level: 5, patterns: ['AB', 'AA'], pending: false },
  { category: 'SS', level: 6, patterns: [], pending: true, description: 'Four-letter code XXXX — matching rule pending confirmation' },
  { category: 'SS', level: 7, patterns: [], pending: true, description: 'Three-letter code XXX — matching rule pending confirmation' }
]);

const CATEGORY_ORDER = { A: 0, B: 1, C: 2 };
const MAX_LENGTH = Math.max(...[...CONFIG, ...SVIP_CONFIG].flatMap((entry) => entry.patterns.map((pattern) => pattern.length)));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function structure(value) {
  if (typeof value !== 'string' || value.length === 0) return null;
  const chars = [...value];
  const isDigit = /^\d$/.test(chars[0]);
  const isLetter = /^[A-Z]$/.test(chars[0]);
  if ((!isDigit && !isLetter) || chars.some((char) => (isDigit ? !/^\d$/.test(char) : !/^[A-Z]$/.test(char)))) {
    return null;
  }

  const symbols = [];
  return chars.map((char) => {
    let index = symbols.indexOf(char);
    if (index === -1) {
      symbols.push(char);
      index = symbols.length - 1;
    }
    return String.fromCharCode(65 + index);
  }).join('');
}

function patternCandidates(pattern, config = CONFIG) {
  return config.flatMap((entry) => entry.patterns.map((label) => ({
    category: entry.category,
    level: entry.level,
    label,
    canonical: structure(label)
  }))).filter((candidate) => candidate.canonical === pattern);
}

function normalState(state) {
  return state && typeof state === 'object' ? state : createState();
}

function ownerOf(state, input) {
  const owner = state.owned && state.owned[input];
  return owner === undefined ? null : owner;
}

function validate(input, state) {
  const currentState = normalState(state);
  const normalizedInput = typeof input === 'string' ? input.toUpperCase() : '';
  const pattern = structure(normalizedInput);
  const route = currentState.route === 'svip' ? 'svip' : 'wealth';
  const base = { ok: false, input: normalizedInput, pattern, category: null, level: null, route, entitlement: null, error: null };

  if (!pattern) return { ...base, error: 'Use only letters or only numbers, without spaces.' };
  if (normalizedInput.length > MAX_LENGTH) return { ...base, error: 'This Pretty ID is not available.' };

  const config = route === 'svip' ? SVIP_CONFIG : CONFIG;
  const candidates = patternCandidates(pattern, config);
  if (!candidates.length) return { ...base, error: 'This Pretty ID is not available.' };

  if (route === 'svip' && !currentState.svipActive) {
    return { ...base, error: 'Your SVIP redemption entitlement has expired.' };
  }

  const unlocked = candidates
    .filter((candidate) => route === 'svip'
      ? Number(currentState.svip ?? 0) >= candidate.level
      : candidate.level <= Number(currentState.level ?? 100))
    .sort((left, right) => CATEGORY_ORDER[left.category] - CATEGORY_ORDER[right.category] || right.level - left.level);
  const selected = unlocked[0];
  if (!selected) {
    const minimum = Math.min(...candidates.map((candidate) => candidate.level));
    return {
      ...base,
      level: minimum,
      entitlement: route === 'svip' ? `SVIP${minimum}` : `LV${minimum}`,
      error: route === 'svip' ? `Unlock at SVIP${minimum}.` : `Unlock at Wealth Level LV${minimum}.`
    };
  }

  const ownedBy = ownerOf(currentState, normalizedInput);
  if (ownedBy !== null || currentState.current === normalizedInput) {
    return { ...base, category: selected.category, level: selected.level, entitlement: route === 'svip' ? `SVIP${selected.level}` : `LV${selected.level}`, error: 'This Pretty ID is already taken.' };
  }

  if (Number(currentState.remaining ?? 0) <= 0) {
    return { ...base, category: selected.category, level: selected.level, entitlement: route === 'svip' ? `SVIP${selected.level}` : `LV${selected.level}`, error: 'You have reached the redemption limit.' };
  }

  return { ...base, ok: true, category: selected.category, level: selected.level, entitlement: route === 'svip' ? `SVIP${selected.level}` : `LV${selected.level}`, error: null };
}

function createState(overrides = {}) {
  return {
    level: 100,
    remaining: 2,
    current: '',
    svip: 0,
    svipActive: true,
    route: 'wealth',
    owned: {},
    rewards: [],
    records: [],
    ...clone(overrides)
  };
}

function redeem(input, state, operationId) {
  const before = createState(state || {});
  const opid = String(operationId ?? '');
  const previous = before.records.find((record) => record.operationId === opid);
  if (opid && previous) {
    return { ok: true, state: clone(before), input: previous.input, pattern: previous.pattern, category: previous.category, level: previous.level, route: previous.route, entitlement: previous.entitlement, operationId: opid, idempotent: true };
  }

  const check = validate(input, before);
  if (!check.ok) return { ...check, state: clone(before), operationId: opid, idempotent: false };

  const after = clone(before);
  after.remaining -= 1;
  after.current = check.input;
  after.owned[check.input] = 'self';
  const reward = { input: check.input, pattern: check.pattern, category: check.category, level: check.level, route: check.route, entitlement: check.entitlement };
  if (!after.rewards.includes(check.category)) after.rewards.push(check.category);
  after.records.push({ ...reward, operationId: opid });
  return { ...check, state: after, operationId: opid, idempotent: false };
}

const PrettyEngine = Object.freeze({ CONFIG, config: CONFIG, SVIP_CONFIG, svipConfig: SVIP_CONFIG, maxLength: MAX_LENGTH, structure, createState, validate, redeem });

if (typeof globalThis !== 'undefined') globalThis.PrettyEngine = PrettyEngine;
if (typeof module !== 'undefined' && module.exports) module.exports = PrettyEngine;


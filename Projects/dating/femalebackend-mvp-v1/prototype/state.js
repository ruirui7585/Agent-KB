/**
 * backend-config-state
 *
 * Maps to frontend state.js structure but defines config domains,
 * not UI interaction state.
 *
 * Each key corresponds to a backend-config/*.json config file.
 * This is a config visualization shell — no runtime logic.
 */

var configState = {

  /* --- Active config snapshot --- */
  activeConfig: 'models',

  /* --- Config load states --- */
  loadStates: {
    models:       'stale',   /* stale | loading | loaded | error */
    traffic:      'stale',
    scheduling:   'stale',
    risk:         'stale',
    commission:   'stale',
    constraints:  'stale'
  },

  /* --- Config schema versions --- */
  schemaVersions: {
    models:       '0.1.0',
    traffic:      '0.1.0',
    scheduling:   '0.1.0',
    risk:         '0.1.0',
    commission:   '0.1.0',
    constraints:  '0.1.0'
  },

  /* --- Validation status per config --- */
  validation: {
    models:       { valid: null, errors: [] },
    traffic:      { valid: null, errors: [] },
    scheduling:   { valid: null, errors: [] },
    risk:         { valid: null, errors: [] },
    commission:   { valid: null, errors: [] },
    constraints:  { valid: null, errors: [] }
  },

  /* --- Simulation mode flags --- */
  simulation: {
    enabled: false,
    scenario: null
  }
};

/**
 * backend-config-data
 *
 * Maps to frontend data.js structure.
 * Provides config template definitions consumed by the config shell.
 *
 * NO frontend runtime data. NO mock male/female user data.
 * Only config-domain entity templates.
 */

/* --- Config Domain Registry --- */
var configDomains = [
  { key: 'models',       label: 'Model Config',       source: 'backend-config/model-config.json' },
  { key: 'traffic',      label: 'Traffic Rules',      source: 'backend-config/traffic-rules.json' },
  { key: 'scheduling',   label: 'Scheduling Rules',   source: 'backend-config/scheduling-rules.json' },
  { key: 'risk',         label: 'Risk Rules',         source: 'backend-config/risk-rules.json' },
  { key: 'commission',   label: 'Commission Rules',   source: 'backend-config/commission-rules.json' },
  { key: 'constraints',  label: 'System Constraints', source: 'backend-config/system-constraints.json' }
];

/* --- Config Panel Definitions --- */
var configPanels = {
  models: {
    title: 'Model Config Preview',
    description: 'Model profiles as defined in backend configuration.',
    fields: ['id', 'name', 'age', 'city', 'country', 'lbs', 'grade', 'priority', 'tags', 'persona', 'voice']
  },
  traffic: {
    title: 'Traffic Rules Preview',
    description: 'Exposure allocation and routing rules across models and geo zones.',
    fields: ['model_weight', 'geo_weight', 'exposure_tier', 'max_concurrent', 'routing_bias']
  },
  scheduling: {
    title: 'Scheduling Rules Preview',
    description: 'Active hour windows, peak coverage, and shift definitions.',
    fields: ['model_id', 'schedule_grid', 'peak_windows', 'online_rate_target', 'timeout_minutes']
  },
  risk: {
    title: 'Risk Rules Preview',
    description: 'Risk thresholds, penalty actions, and factor weights.',
    fields: ['risk_level_thresholds', 'factor_weights', 'penalty_actions', 'cooldown_hours']
  },
  commission: {
    title: 'Commission Rules Preview',
    description: 'Diamond rewards, commission splits, and payout rules.',
    fields: ['action_type', 'operator_percent', 'platform_percent', 'diamond_value', 'tier_multiplier']
  },
  constraints: {
    title: 'System Constraints Preview',
    description: 'Global system limits and guardrails.',
    fields: ['max_models_per_operator', 'max_conversations_per_model', 'free_message_limit', 'timeout_threshold', 'rate_limits']
  }
};

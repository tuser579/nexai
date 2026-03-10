export const AI_MODELS = [
  // ── Google Gemini ────────────────────────────
  {
    id:          'gemini-2.0-flash',
    label:       'Gemini 2.0 Flash',
    provider:    'Google',
    free:        true,
    fast:        true,
    description: 'Latest Gemini — fast and free',
    badge:       'FREE',
    badgeColor:  '#4ade80',
  },

  // ── Groq ─────────────────────────────────────
  {
    id:          'llama-3.3-70b-versatile',
    label:       'Llama 3.3 70B',
    provider:    'Groq',
    free:        true,
    fast:        true,
    description: '1,000 req/day free — very capable',
    badge:       'FREE',
    badgeColor:  '#4ade80',
  },
  {
    id:          'llama-3.1-8b-instant',
    label:       'Llama 3.1 8B',
    provider:    'Groq',
    free:        true,
    fast:        true,
    description: '14,400 req/day free — ultrafast',
    badge:       'FREE',
    badgeColor:  '#4ade80',
  },
  {
    id:          'mixtral-8x7b-32768',
    label:       'Mixtral 8x7B',
    provider:    'Groq',
    free:        true,
    fast:        true,
    description: '14,400 req/day — powerful & free',
    badge:       'FREE',
    badgeColor:  '#4ade80',
  },
  {
    id:          'gemma2-9b-it',
    label:       'Gemma 2 9B',
    provider:    'Groq',
    free:        true,
    fast:        true,
    description: '14,400 req/day — Google open model',
    badge:       'FREE',
    badgeColor:  '#4ade80',
  },

  // ── OpenAI ───────────────────────────────────
  {
    id:          'gpt-3.5-turbo',
    label:       'GPT-3.5 Turbo',
    provider:    'OpenAI',
    free:        false,
    fast:        true,
    description: 'Requires OpenAI API key',
    badge:       'API KEY',
    badgeColor:  '#f59e0b',
  },
  {
    id:          'gpt-4o',
    label:       'GPT-4o',
    provider:    'OpenAI',
    free:        false,
    fast:        false,
    description: 'Most capable — paid OpenAI key',
    badge:       'PAID',
    badgeColor:  '#f87171',
  },

  // ── Together AI ──────────────────────────────
  {
    id:          'mistralai/Mixtral-8x7B-Instruct-v0.1',
    label:       'Mixtral (Together)',
    provider:    'Together AI',
    free:        false,
    fast:        true,
    description: 'Requires Together AI key',
    badge:       'API KEY',
    badgeColor:  '#a78bfa',
  },
]

export const DEFAULT_MODEL = 'gemini-2.0-flash'
export const FREE_MODELS   = AI_MODELS.filter((m) => m.free)

export function getModelById(id) {
  return AI_MODELS.find((m) => m.id === id) || AI_MODELS[0]
}
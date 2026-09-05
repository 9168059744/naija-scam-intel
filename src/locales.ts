import { SupportedLang } from './types'

// Language metadata used by the Navbar language dropdown & shared selectors
export const SUPPORTED_LANGUAGES: { code: SupportedLang; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ha', label: 'Hausa', flag: '🇳🇬' },
  { code: 'pcm', label: 'Pidgin', flag: '💬' },
  { code: 'yo', label: 'Yoruba', flag: '🇳🇬' },
  { code: 'ig', label: 'Igbo', flag: '🇳🇬' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
]

export const LANG_CODES: SupportedLang[] = ['en', 'ha', 'pcm', 'yo', 'ig', 'fr']

// Returns the localized value for a key on an object that carries
// `value` + optional `value_<lang>` fields (used by lessons & questions).
export function localize<T>(
  obj: T,
  baseKey: string,
  lang: SupportedLang
): string {
  const rec = obj as unknown as Record<string, unknown>
  const direct = rec[`${baseKey}_${lang}`]
  if (lang !== 'en' && typeof direct === 'string' && direct.length > 0) return direct
  const fallback = rec[baseKey]
  return typeof fallback === 'string' ? fallback : ''
}

// Maps a language to an array helper for localized option lists (quiz answers)
export function localizeArr<T>(
  obj: T,
  baseKey: string,
  lang: SupportedLang
): string[] {
  const rec = obj as unknown as Record<string, unknown>
  const direct = rec[`${baseKey}_${lang}`]
  if (lang !== 'en' && Array.isArray(direct) && direct.length > 0) return direct as string[]
  const fallback = rec[baseKey]
  return Array.isArray(fallback) ? (fallback as string[]) : []
}

// Picks a UI string for the active language with English fallback.
// Used by components that render one-off labels via `lang === 'en' ? ... : ...`.
export function tr(lang: SupportedLang, en: string, ha: string, pcm: string, yo: string, ig: string, fr: string): string {
  switch (lang) {
    case 'ha': return ha || en
    case 'pcm': return pcm || en
    case 'yo': return yo || en
    case 'ig': return ig || en
    case 'fr': return fr || en
    default: return en
  }
}
// Production utilities for Replit deployment compatibility
// Addresses encoding and filtering issues specific to production environment

/**
 * Normalizes strings for consistent comparison in production environment
 * Handles UTF-8 encoding differences between development and deployment
 */
export function normalizeForComparison(str: string): string {
  if (!str) return '';
  
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD') // Canonical decomposition
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s]/g, ''); // Remove special characters except word chars and spaces
}

/**
 * Safe category filtering that works in both development and production
 */
export function categoryMatches(itemCategory: string, filterCategory: string): boolean {
  if (filterCategory === "all") return true;
  
  // Try exact match first (for development)
  if (itemCategory === filterCategory) return true;
  
  // Try normalized match (for production encoding differences)
  return normalizeForComparison(itemCategory) === normalizeForComparison(filterCategory);
}

/**
 * Safe text search that handles encoding differences
 */
export function textIncludes(text: string, search: string): boolean {
  if (!search) return true;
  
  // Try normal case-insensitive search first
  if (text.toLowerCase().includes(search.toLowerCase())) return true;
  
  // Try normalized search for production compatibility
  return normalizeForComparison(text).includes(normalizeForComparison(search));
}

/**
 * Debug utility to check string encoding differences
 */
export function debugStringEncoding(str: string): {
  original: string;
  normalized: string;
  charCodes: number[];
  length: number;
} {
  return {
    original: str,
    normalized: normalizeForComparison(str),
    charCodes: Array.from(str).map(c => c.charCodeAt(0)),
    length: str.length
  };
}

/**
 * Categories with normalized versions for production matching
 */
export const CATEGORY_MAPPINGS = {
  'Mobiliario': ['mobiliario', 'Mobiliario'],
  'Menú': ['menu', 'Menu', 'Menú', 'menú'],
  'Decoración': ['decoracion', 'Decoración', 'decoracion'],
  'Branding': ['branding', 'Branding'],
  'Audio y Video': ['audio y video', 'Audio y Video', 'audiovideo'],
  'Espectáculos': ['espectaculos', 'Espectáculos', 'espectaculos'],
  'Fotografía': ['fotografia', 'Fotografía', 'fotografia'],
  'Memorabilia': ['memorabilia', 'Memorabilia']
};

/**
 * Find matching category from mappings
 */
export function findMatchingCategory(category: string): string | null {
  const normalized = normalizeForComparison(category);
  
  for (const [key, variants] of Object.entries(CATEGORY_MAPPINGS)) {
    if (variants.some(variant => normalizeForComparison(variant) === normalized)) {
      return key;
    }
  }
  
  return null;
}
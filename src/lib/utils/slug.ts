/**
 * Utility functions for generating URL-friendly slugs
 */

/**
 * Generates a URL-friendly slug from a string
 * - Converts to lowercase
 * - Removes special characters except hyphens and underscores
 * - Replaces spaces and multiple hyphens with single hyphens
 * - Trims hyphens from start and end
 *
 * @param text - The text to convert to slug
 * @returns URL-friendly slug
 */
export function generateSlug(text: string): string {
  if (!text) return "";

  return (
    text
      .toLowerCase()
      .trim()
      // Replace Cyrillic characters with Latin equivalents
      .replace(/а/g, "a")
      .replace(/б/g, "b")
      .replace(/в/g, "v")
      .replace(/г/g, "g")
      .replace(/д/g, "d")
      .replace(/е/g, "e")
      .replace(/ё/g, "e")
      .replace(/ж/g, "zh")
      .replace(/з/g, "z")
      .replace(/и/g, "i")
      .replace(/й/g, "y")
      .replace(/к/g, "k")
      .replace(/л/g, "l")
      .replace(/м/g, "m")
      .replace(/н/g, "n")
      .replace(/о/g, "o")
      .replace(/п/g, "p")
      .replace(/р/g, "r")
      .replace(/с/g, "s")
      .replace(/т/g, "t")
      .replace(/у/g, "u")
      .replace(/ф/g, "f")
      .replace(/х/g, "h")
      .replace(/ц/g, "ts")
      .replace(/ч/g, "ch")
      .replace(/ш/g, "sh")
      .replace(/щ/g, "sch")
      .replace(/ъ/g, "")
      .replace(/ы/g, "y")
      .replace(/ь/g, "")
      .replace(/э/g, "e")
      .replace(/ю/g, "yu")
      .replace(/я/g, "ya")
      // Remove special characters except hyphens, underscores, and alphanumeric
      .replace(/[^a-z0-9\-_\s]/g, "")
      // Replace spaces and multiple separators with single hyphen
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      // Remove hyphens from start and end
      .replace(/^-+|-+$/g, "")
  );
}

/**
 * Generates a unique slug by appending a number if the slug already exists
 *
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[]
): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validates if a slug is properly formatted
 *
 * @param slug - The slug to validate
 * @returns True if slug is valid
 */
export function isValidSlug(slug: string): boolean {
  if (!slug) return false;

  // Check if slug contains only lowercase letters, numbers, and hyphens
  // Must not start or end with hyphen
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

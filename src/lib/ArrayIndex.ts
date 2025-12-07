/**
 * Non-zero digits for building array index patterns.
 */
type NonZeroDigit = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

/**
 * Base pattern for array indices - provides "0" autocomplete via finite union.
 */
type ArrayIndexBase = "0" | `${NonZeroDigit}` | `${NonZeroDigit}${string}`;

/**
 * Array index type that preserves "0" for autocomplete while only accepting valid numeric strings.
 * Intersection with `${number}` rejects invalid patterns like "1x" while keeping fast autocomplete.
 */
export type ArrayIndex = ArrayIndexBase & `${number}`;

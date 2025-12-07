/**
 * All digits for building array index patterns.
 */
type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

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

/**
 * Single digit values starting from N.
 * Used to provide autocomplete suggestions for array indices.
 */
type SingleDigitsFrom<N extends number> = N extends 0
  ? Digit
  : N extends 1
    ? "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
    : N extends 2
      ? "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
      : N extends 3
        ? "3" | "4" | "5" | "6" | "7" | "8" | "9"
        : N extends 4
          ? "4" | "5" | "6" | "7" | "8" | "9"
          : N extends 5
            ? "5" | "6" | "7" | "8" | "9"
            : N extends 6
              ? "6" | "7" | "8" | "9"
              : N extends 7
                ? "7" | "8" | "9"
                : N extends 8
                  ? "8" | "9"
                  : N extends 9
                    ? "9"
                    : never;

/**
 * Multi-digit numbers (10+).
 */
type MultiDigit =
  | `${NonZeroDigit}${Digit}`
  | `${NonZeroDigit}${Digit}${string}`;

/**
 * Array index type starting from N for autocomplete.
 * ArrayIndexFrom<0> = "0" | "1" | "2" | ... (all valid indices)
 * ArrayIndexFrom<1> = "1" | "2" | "3" | ... (indices >= 1)
 * ArrayIndexFrom<2> = "2" | "3" | "4" | ... (indices >= 2)
 */
export type ArrayIndexFrom<N extends number> = (
  | `${N}`
  | SingleDigitsFrom<N>
  | MultiDigit
) &
  `${number}`;

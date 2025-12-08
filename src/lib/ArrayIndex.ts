// prettier-ignore

import { TupleKeys } from "./TupleKeys";

/**
 * Increment lookup table for counting fixed tuple elements.
 * Supports tuples with up to 8 fixed elements.
 */
type Increment = [1, 2, 3, 4, 5, 6, 7, 8];
type LargerDigits<D extends number> = D extends 0 | Increment[number]
  ? [
      1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
      2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
      3 | 4 | 5 | 6 | 7 | 8 | 9,
      4 | 5 | 6 | 7 | 8 | 9,
      5 | 6 | 7 | 8 | 9,
      6 | 7 | 8 | 9,
      7 | 8 | 9,
      8 | 9,
      9,
    ][D]
  : never;

/**
 * Count the number of fixed elements in a tuple by checking sequential indices.
 * Returns the count of fixed elements (0 for plain arrays, N for [T1, T2, ...TN, ...rest[]]).
 */
type CountFixed<T, N extends number = 0> =
  `${N}` extends TupleKeys<T>
    ? N extends keyof Increment
      ? CountFixed<T, Increment[N]>
      : N
    : N;

type NonZeroDigit = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

/**
 * Get the appropriate array index type for autocomplete.
 * - Plain arrays (string[]): ArrayIndex (suggests "0")
 * - Rest tuples ([string, ...number[]]): suggests fixed keys + first rest index
 */
export type ArrayIndex<T extends readonly unknown[]> =
  number extends T["length"]
    ?
        | TupleKeys<T>
        | `${CountFixed<T>}` // First rest index (show in autocomplete)
        | `${string}${LargerDigits<CountFixed<T>>}` // Pattern for accepting any digit >= CountFixed
        | `${NonZeroDigit}${number}` // Pattern for accepting any numeric >= 10
    : TupleKeys<T>;

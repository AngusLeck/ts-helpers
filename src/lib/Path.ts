import { ArrayElement } from "./ArrayElement";
import { ArrayIndex } from "./ArrayIndex";
import { DecrementDepth, Depth } from "./Depth";
import { ShouldTerminatePathing } from "./ShouldTerminatePathing";
import { Obj } from "./Obj";
import { PrependPath } from "./PrependPath";

/**
 * Extract numeric string keys from a tuple type (fixed indices only).
 */
type NumericKeys<T> = Extract<keyof T, `${number}`>;

/**
 * Increment lookup table for counting fixed tuple elements.
 * Supports tuples with up to 20 fixed elements.
 */
type Increment = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
];

/**
 * Count the number of fixed elements in a tuple by checking sequential indices.
 * Returns the count of fixed elements (0 for plain arrays, N for [T1, T2, ...TN, ...rest[]]).
 */
type CountFixed<T extends readonly unknown[], N extends number = 0> =
  `${N}` extends NumericKeys<T>
    ? N extends keyof Increment
      ? CountFixed<T, Increment[N]>
      : N // Hit the limit (20+), return current count
    : N;

type NonZeroDigit = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

/**
 * Base type for rest tuple indices.
 * Includes specific literals for autocomplete + pattern for acceptance.
 */
type RestTupleIndexBase<T extends readonly unknown[]> =
  | NumericKeys<T> // Fixed keys (show in autocomplete)
  | `${CountFixed<T>}` // First rest index (show in autocomplete)
  | `${NonZeroDigit}${string}`; // Pattern for accepting any numeric >= 10

/**
 * Get the appropriate array index type for autocomplete.
 * - Plain arrays (string[]): ArrayIndex (suggests "0")
 * - Rest tuples ([string, ...number[]]): suggests fixed keys + first rest index
 */
type DynamicArrayIndex<T extends readonly unknown[]> =
  NumericKeys<T> extends never
    ? ArrayIndex // Plain array - suggests "0"
    : RestTupleIndexBase<T> & `${number}`; // Rest tuple - suggests specific indices

/**
 * Internal path builder that recurses through object properties.
 * Handles objects, arrays, and tuples.
 */
type BuildPaths<T, D extends unknown[], Prefix extends string = ""> =
  ShouldTerminatePathing<T, D> extends true
    ? never
    : T extends readonly unknown[] // Array
      ? number extends T["length"] // Dynamic array or rest tuple
        ? // Use DynamicArrayIndex for proper suggestions
            | PrependPath<Prefix, DynamicArrayIndex<T>>
            | BuildPaths<
                ArrayElement<T>,
                DecrementDepth<D>,
                PrependPath<Prefix, DynamicArrayIndex<T>>
              >
        : {
            // Fixed tuple
            [K in keyof T & `${number}`]:
              | PrependPath<Prefix, K>
              | BuildPaths<T[K], DecrementDepth<D>, PrependPath<Prefix, K>>;
          }[keyof T & `${number}`]
      : T extends Obj
        ? {
            [K in keyof T]:
              | PrependPath<Prefix, K>
              | BuildPaths<T[K], DecrementDepth<D>, PrependPath<Prefix, K>>;
          }[keyof T]
        : never;

/**
 * Generates a union of all valid dot-notation paths for type T.
 *
 * @typeParam T - The object type to generate paths for
 * @typeParam D - Depth tuple (default: Depth<5> = 5 levels)
 *
 * @example
 * type Obj = { user: { name: string } };
 * type Paths = Path<Obj>; // "user" | "user.name"
 */
export type Path<T, D extends unknown[] = Depth<5>> = BuildPaths<T, D> & string;

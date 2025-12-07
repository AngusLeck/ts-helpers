import { ArrayElement } from "./ArrayElement";
import { ArrayIndex, ArrayIndexFrom } from "./ArrayIndex";
import { DecrementDepth, Depth } from "./Depth";
import { ShouldTerminatePathing } from "./ShouldTerminatePathing";
import { Obj } from "./Obj";
import { PrependPath } from "./PrependPath";

/**
 * Extract numeric string keys from a tuple type (fixed indices only).
 */
type NumericKeys<T> = Extract<keyof T, `${number}`>;

/**
 * Count the number of fixed elements in a tuple by checking sequential indices.
 * Returns the count of fixed elements (0 for plain arrays, N for [T1, T2, ...TN, ...rest[]]).
 */
type CountFixed<T extends readonly unknown[], N extends number = 0> =
  `${N}` extends NumericKeys<T>
    ? CountFixed<
        T,
        N extends 0
          ? 1
          : N extends 1
            ? 2
            : N extends 2
              ? 3
              : N extends 3
                ? 4
                : N extends 4
                  ? 5
                  : N extends 5
                    ? 6
                    : N extends 6
                      ? 7
                      : N extends 7
                        ? 8
                        : N extends 8
                          ? 9
                          : 10
      >
    : N;

/**
 * Get the appropriate array index type for autocomplete.
 * - Plain arrays (string[]): ArrayIndex (starts at 0)
 * - Rest tuples ([string, ...number[]]): fixed keys + ArrayIndexFrom<fixedCount>
 */
type DynamicArrayIndex<T extends readonly unknown[]> =
  NumericKeys<T> extends never
    ? ArrayIndex // Plain array - suggest from 0
    : NumericKeys<T> | ArrayIndexFrom<CountFixed<T>>; // Rest tuple - fixed keys + first rest index

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

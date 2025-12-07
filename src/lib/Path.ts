import { IsDepthExhausted, DecrementDepth, Depth } from "./Depth";

/**
 * Matches any primitive value.
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Primitive
 */
type Primitive = string | number | boolean | bigint | symbol | null | undefined;

/**
 * Built-in types that should not be recursed into.
 * Includes primitives, void, and common built-in objects.
 */
type BuiltIn = Primitive | void | Date | RegExp | Error;

/**
 * Types that should never be recursed into for path generation.
 * Includes primitives, built-in objects, functions, constructors, promises,
 * and collection types (Map, Set, WeakMap, WeakSet).
 *
 * Aligned with type-fest's NonRecursiveType for compatibility.
 */
type NonRecursiveType =
  | BuiltIn
  | ((...args: unknown[]) => unknown) // Functions
  | (new (...args: unknown[]) => unknown) // Class constructors
  | Promise<unknown>
  | ReadonlyMap<unknown, unknown>
  | Map<unknown, unknown>
  | ReadonlySet<unknown>
  | Set<unknown>
  | WeakMap<WeakKey, unknown>
  | WeakSet<WeakKey>;

/**
 * Check if a type is a non-recursible type (should not generate nested paths).
 */
type IsLeafType<T> = T extends NonRecursiveType ? true : false;

/**
 * Converts a key to a string representation.
 */
type KeyToString<K> = K extends string ? K : K extends number ? `${K}` : never;

/**
 * Check if a type is a dynamic array (not a tuple).
 * Dynamic arrays have flexible length (number extends T["length"]).
 */
type IsDynamicArray<T> = T extends readonly unknown[]
  ? number extends T["length"]
    ? true
    : false
  : false;

/**
 * Extract the element type from an array.
 */
type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;

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
type ArrayIndex = ArrayIndexBase & `${number}`;

/**
 * Internal path builder that recurses through object properties.
 * Handles objects, arrays, and tuples.
 */
type BuildPaths<T, D extends unknown[], Prefix extends string = ""> =
  IsDepthExhausted<D> extends true
    ? never
    : IsLeafType<T> extends true
      ? never
      : IsDynamicArray<T> extends true
        ? // Dynamic array: produce "0" for autocomplete + patterns for any positive int
            // ArrayIndex keeps "0" distinct so autocomplete shows it
            | (Prefix extends "" ? ArrayIndex : `${Prefix}.${ArrayIndex}`)
            | BuildPaths<
                ArrayElement<T>,
                DecrementDepth<D>,
                Prefix extends "" ? ArrayIndex : `${Prefix}.${ArrayIndex}`
              >
        : T extends readonly unknown[]
          ? // Tuple: use numeric indices
            {
              [K in keyof T & `${number}`]:
                | (Prefix extends "" ? K : `${Prefix}.${K}`)
                | BuildPaths<
                    T[K & keyof T],
                    DecrementDepth<D>,
                    Prefix extends "" ? K : `${Prefix}.${K}`
                  >;
            }[keyof T & `${number}`]
          : T extends object
            ? // Regular object
              {
                [K in keyof T & (string | number)]:
                  | (Prefix extends ""
                      ? KeyToString<K>
                      : `${Prefix}.${KeyToString<K>}`)
                  | BuildPaths<
                      T[K],
                      DecrementDepth<D>,
                      Prefix extends ""
                        ? KeyToString<K>
                        : `${Prefix}.${KeyToString<K>}`
                    >;
              }[keyof T & (string | number)]
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
type Path<T, D extends unknown[] = Depth<5>> = BuildPaths<T, D>;

export {
  ArrayElement,
  ArrayIndex,
  BuildPaths,
  BuiltIn,
  DecrementDepth,
  Depth,
  IsDepthExhausted,
  IsDynamicArray,
  IsLeafType,
  KeyToString,
  NonRecursiveType,
  Path,
  Primitive,
};

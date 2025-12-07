import { ArrayElement } from "./ArrayElement";
import { ArrayIndex } from "./ArrayIndex";
import { DecrementDepth, Depth, IsDepthExhausted } from "./Depth";
import { IsLeafType } from "./IsLeafType";
import { Obj } from "./Obj";
import { PrependPath } from "./PrependPath";

/** Stop if the depth is exhausted or the type is a leaf type. */
type ShouldTerminatePathing<T, D extends unknown[]> =
  IsDepthExhausted<D> extends true
    ? true
    : IsLeafType<T> extends true
      ? true
      : false;

/**
 * Internal path builder that recurses through object properties.
 * Handles objects, arrays, and tuples.
 */
type BuildPaths<T, D extends unknown[], Prefix extends string = ""> =
  ShouldTerminatePathing<T, D> extends true
    ? never
    : T extends readonly unknown[] // Array
      ? number extends T["length"] // Dynamic array
        ? // ArrayIndex keeps "0" distinct so autocomplete shows it
            | PrependPath<ArrayIndex, Prefix>
            | BuildPaths<
                ArrayElement<T>,
                DecrementDepth<D>,
                PrependPath<ArrayIndex, Prefix>
              >
        : {
            // Tuple
            [K in keyof T & `${number}`]:
              | PrependPath<K, Prefix>
              | BuildPaths<T[K], DecrementDepth<D>, PrependPath<K, Prefix>>;
          }[keyof T & `${number}`]
      : T extends Obj
        ? {
            [K in keyof T]:
              | PrependPath<K, Prefix>
              | BuildPaths<T[K], DecrementDepth<D>, PrependPath<K, Prefix>>;
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
export type Path<T, D extends unknown[] = Depth<5>> = BuildPaths<T, D>;

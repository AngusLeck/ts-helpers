import { DecrementDepth, Depth } from "./Depth.js";
import { ShouldTerminatePathing } from "./ShouldTerminatePathing.js";
import { Obj } from "./Obj.js";
import { PrependPath } from "./PrependPath.js";
import { ToNumber } from "./ToNumber.js";
import { ArrayIndex } from "./ArrayIndex.js";

/**
 * Internal path builder that recurses through object properties.
 * Handles objects, arrays, and tuples.
 */
type BuildPaths<T, D extends unknown[], Prefix extends string = ""> =
  ShouldTerminatePathing<T, D> extends true
    ? never
    : T extends readonly unknown[]
      ? {
          [K in ArrayIndex<T>]:
            | PrependPath<Prefix, K>
            | BuildPaths<
                T[ToNumber<K>],
                DecrementDepth<D>,
                PrependPath<Prefix, K>
              >;
        }[ArrayIndex<T>]
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

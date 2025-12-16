import { DecrementDepth, Depth } from "./Depth.js";
import { PrependPath } from "./PrependPath.js";
import { Obj } from "./Obj.js";
import { ArrayIndex } from "./ArrayIndex.js";
import { ShouldTerminatePathing } from "./ShouldTerminatePathing.js";
import { Path } from "./Path.js";
import { ToNumber } from "./ToNumber.js";

type IfExtends<Value, Target, Then> = Value extends Target ? Then : never;

/**
 * Internal path builder that only produces paths ending in type Target.
 */
type BuildPathsEndingIn<
  T,
  Target,
  D extends unknown[],
  Prefix extends string = "",
> =
  ShouldTerminatePathing<T, D> extends true
    ? never
    : T extends readonly unknown[]
      ? {
          [K in ArrayIndex<T>]:
            | IfExtends<T[ToNumber<K>], Target, PrependPath<Prefix, K>>
            | BuildPathsEndingIn<
                T[ToNumber<K>],
                Target,
                DecrementDepth<D>,
                PrependPath<Prefix, K>
              >;
        }[ArrayIndex<T>]
      : T extends Obj
        ? {
            [K in keyof T]:
              | IfExtends<T[K], Target, PrependPath<Prefix, K>>
              | BuildPathsEndingIn<
                  T[K],
                  Target,
                  DecrementDepth<D>,
                  PrependPath<Prefix, K>
                >;
          }[keyof T]
        : never;

/**
 * Generates a union of all valid dot-notation paths for type T that terminate in type Target.
 *
 * @typeParam T - The object type to generate paths for
 * @typeParam Target - The type that paths must end in
 * @typeParam D - Depth tuple (default: Depth<5> = 5 levels)
 *
 * @example
 * type Obj = { name: string; age: number; nested: { title: string } };
 * type StringPaths = PathEndingIn<Obj, string>; // "name" | "nested.title"
 * type NumberPaths = PathEndingIn<Obj, number>; // "age"
 */
export type PathEndingIn<
  T,
  Target,
  D extends unknown[] = Depth<5>,
> = BuildPathsEndingIn<T, Target, D> & Path<T, D>;

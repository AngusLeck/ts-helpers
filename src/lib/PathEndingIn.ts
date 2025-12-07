import { ArrayElement } from "./ArrayElement";
import { DecrementDepth, Depth } from "./Depth";
import { PrependPath } from "./PrependPath";
import { Obj } from "./Obj";
import { ArrayIndex } from "./ArrayIndex";
import { ShouldTerminatePathing } from "./ShouldTerminatePathing";
import { NonEmptyString } from "./NonEmptyString";

/**
 * Internal path builder that only produces paths ending in type Target.
 */
type BuildPathsEndingIn<
  T,
  Target,
  D extends unknown[],
  Prefix extends string = "",
> = T extends Target
  ? NonEmptyString<Prefix>
  : ShouldTerminatePathing<T, D> extends true
    ? never
    : T extends readonly unknown[] // Array
      ? number extends T["length"] // Dynamic array
        ? // ArrayIndex keeps "0" distinct so autocomplete shows it
          BuildPathsEndingIn<
            ArrayElement<T>,
            Target,
            DecrementDepth<D>,
            PrependPath<ArrayIndex, Prefix>
          >
        : {
            // Tuple
            [K in keyof T & `${number}`]: BuildPathsEndingIn<
              T[K],
              Target,
              DecrementDepth<D>,
              PrependPath<K, Prefix>
            >;
          }[keyof T & `${number}`]
      : T extends Obj
        ? {
            [K in keyof T]: BuildPathsEndingIn<
              T[K],
              Target,
              DecrementDepth<D>,
              PrependPath<K, Prefix>
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
type PathEndingIn<
  T,
  Target,
  D extends unknown[] = Depth<5>,
> = BuildPathsEndingIn<T, Target, D>;

export { BuildPathsEndingIn, PathEndingIn };

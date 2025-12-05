import {
  ArrayElement,
  DecrementDepth,
  Depth,
  IsDepthExhausted,
  IsDynamicArray,
  IsLeafType,
  KeyToString,
} from "./Path";

/**
 * Internal path builder that only produces paths ending in type Target.
 */
type BuildPathsEndingIn<
  T,
  Target,
  D extends unknown[],
  Prefix extends string = "",
> =
  IsDepthExhausted<D> extends true
    ? never
    : IsLeafType<T> extends true
      ? T extends Target
        ? Prefix
        : never
      : IsDynamicArray<T> extends true
        ? // For arrays: check if array itself matches, or if elements match
            | (T extends Target ? (Prefix extends "" ? never : Prefix) : never)
            | (ArrayElement<T> extends Target
                ? Prefix extends ""
                  ? "0"
                  : `${Prefix}.0`
                : never)
            | BuildPathsEndingIn<
                ArrayElement<T>,
                Target,
                DecrementDepth<D>,
                Prefix extends "" ? "0" : `${Prefix}.0`
              >
        : T extends readonly unknown[]
          ? // Tuple handling
              | (T extends Target
                  ? Prefix extends ""
                    ? never
                    : Prefix
                  : never)
              | {
                  [K in keyof T & `${number}`]:
                    | (T[K & keyof T] extends Target
                        ? Prefix extends ""
                          ? K
                          : `${Prefix}.${K}`
                        : never)
                    | BuildPathsEndingIn<
                        T[K & keyof T],
                        Target,
                        DecrementDepth<D>,
                        Prefix extends "" ? K : `${Prefix}.${K}`
                      >;
                }[keyof T & `${number}`]
          : T extends object
            ? // Regular object
                | (T extends Target
                    ? Prefix extends ""
                      ? never
                      : Prefix
                    : never)
                | {
                    [K in keyof T & (string | number)]:
                      | (T[K] extends Target
                          ? Prefix extends ""
                            ? KeyToString<K>
                            : `${Prefix}.${KeyToString<K>}`
                          : never)
                      | BuildPathsEndingIn<
                          T[K],
                          Target,
                          DecrementDepth<D>,
                          Prefix extends ""
                            ? KeyToString<K>
                            : `${Prefix}.${KeyToString<K>}`
                        >;
                  }[keyof T & (string | number)]
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

/* eslint-disable @typescript-eslint/no-explicit-any */

type Obj = {
  [key in any]: any;
};

/**
 * Just works like `${T}` but it doesn't complain if you give it eg a symbol.
 */
type ToString<T> = T extends
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  ? `${T}`
  : undefined;

type RecursivePath<K, T> = T extends Obj
  ? {
      [K1 in keyof T]:
        | ToString<K>
        | RecursivePath<`${ToString<K>}.${ToString<K1>}`, T[K1]>;
    }
  : ToString<K>;

type NestedPath<T> = T extends Obj
  ? {
      [K in keyof T]: RecursivePath<K, T[K]>;
    }
  : undefined;

type Flattened<T> = T extends Obj ? Flattened<T[keyof T]> : T;

/**
 * Returns all the paths of T as "." separated keys of T
 */
type Path<T> = Flattened<NestedPath<T>> & string;

export { Path };

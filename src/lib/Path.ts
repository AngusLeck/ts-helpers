import { Obj } from "./Obj";
import { ToString } from "./ToString";

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

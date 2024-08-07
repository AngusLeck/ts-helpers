import { FlattenedPath } from "./FlattenedPath";
import { Func } from "./Func";
import { Obj } from "./Obj";
import { ToString } from "./ToString";

type RecursivePath<K, T> = T extends Func
  ? ToString<K>
  : T extends Obj
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

/**
 * Returns all the paths of T as "." separated keys of T
 */
type Path<T> = FlattenedPath<NestedPath<T>> & string;

export { Path };

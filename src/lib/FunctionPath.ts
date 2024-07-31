import { FlattenedPath } from "./FlattenedPath";
import { Func } from "./Func";
import { Obj } from "./Obj";
import { ToString } from "./ToString";

type RecursiveFunctionPath<K, T> = T extends Func
  ? ToString<K>
  : T extends Obj
  ? {
      [K1 in keyof T]: RecursiveFunctionPath<
        `${ToString<K>}.${ToString<K1>}`,
        T[K1]
      >;
    }
  : never;

type NestedPath<T> = T extends Obj
  ? {
      [K in keyof T]: RecursiveFunctionPath<K, T[K]>;
    }
  : undefined;

/**
 * Returns all the paths of T as "." separated keys of T
 */
type FunctionPath<T> = FlattenedPath<NestedPath<T>> & string;

export { FunctionPath };

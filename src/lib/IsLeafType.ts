import { BuiltIn } from "./BuiltIn";

/**
 * Types that should never be recursed into for path generation.
 * Includes primitives, built-in objects, functions, promises,
 * and collection types (Map, Set, WeakMap, WeakSet).
 *
 * Aligned with type-fest's NonRecursiveType for compatibility.
 */
type NonRecursiveType =
  | BuiltIn
  | ((...args: unknown[]) => unknown) // Functions
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
export type IsLeafType<T> = T extends NonRecursiveType ? true : false;

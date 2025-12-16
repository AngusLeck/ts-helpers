import { ToNumber } from "./ToNumber.js";
import { TupleKeys } from "./TupleKeys.js";

/**
 * Check if K is a fixed index in tuple T (not part of the rest portion).
 */
type IsRestKeyOrOptional<
  T extends readonly unknown[],
  K extends string | number,
> = K extends TupleKeys<T> ? (T[K] extends undefined ? true : false) : true;

/**
 * Can't simply use T[K] because if T is a union type, then K may not be a key,
 * when really we want to just treat it as an optional key.
 */
export type GetKey<T, K extends string | number> = T extends readonly unknown[]
  ? // Array
    IsRestKeyOrOptional<T, K> extends true
    ? T[ToNumber<K>] | undefined
    : T[ToNumber<K>]
  : // Object
    T extends { [k in K]: infer V }
    ? V
    : T extends { [k in K]?: infer V }
      ? V | undefined
      : undefined;

/**
 * Check if a tuple type has a rest element.
 * [string, number] -> false
 * [string, ...number[]] -> true
 */
export type HasRestElement<T extends readonly unknown[]> =
  number extends T["length"] ? true : false;

/**
 * Get the number of explicit (non-rest) elements in a tuple.
 * For [string, number, ...boolean[]], returns 2.
 * For tuples without rest, returns the full length.
 */
export type ExplicitTupleLength<T extends readonly unknown[]> =
  HasRestElement<T> extends true
    ? ExplicitLengthCounter<T>
    : T["length"];

/**
 * Count explicit elements by recursively peeling off elements from the tuple.
 * Stops when the remaining tuple has an unbounded length (indicating rest element).
 */
type ExplicitLengthCounter<T extends readonly unknown[]> =
  T extends readonly [unknown, ...infer Rest]
    ? number extends Rest["length"]
      ? 1 // Rest is unbounded, so we've found the boundary
      : 1 + ExplicitLengthCounter<Rest>
    : 0;

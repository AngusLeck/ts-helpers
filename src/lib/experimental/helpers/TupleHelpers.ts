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
  number extends T["length"] ? ExplicitLengthCounter<T> : T["length"];

/**
 * Count explicit elements by recursively peeling off elements from the tuple.
 * Stops when the remaining tuple is just a plain array (no more explicit elements).
 * Uses a counter tuple to accumulate the count.
 */
type ExplicitLengthCounter<
  T extends readonly unknown[],
  Counter extends unknown[] = [],
> = T extends readonly [unknown, ...infer Rest extends readonly unknown[]]
  ? number extends Rest["length"]
    ? // Rest has unbounded length - check if it still has explicit elements
      Rest extends readonly [unknown, ...unknown[]]
      ? ExplicitLengthCounter<Rest, [...Counter, 0]> // Still has explicit elements
      : [...Counter, 0]["length"] // Rest is just a plain array, stop here
    : ExplicitLengthCounter<Rest, [...Counter, 0]> // Rest is a fixed tuple
  : Counter["length"];

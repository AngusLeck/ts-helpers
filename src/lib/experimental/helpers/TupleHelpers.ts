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
 * Count explicit elements by iterating until we hit the rest element.
 * Uses a counter tuple that grows until we can't index anymore.
 */
type ExplicitLengthCounter<
  T extends readonly unknown[],
  Counter extends unknown[] = [],
> = Counter["length"] extends keyof T
  ? T[Counter["length"]] extends T[number]
    ? // Check if this position is part of rest by seeing if next position exists
      [...Counter, 0]["length"] extends keyof T
      ? ExplicitLengthCounter<T, [...Counter, 0]>
      : [...Counter, 0]["length"]
    : Counter["length"]
  : Counter["length"];

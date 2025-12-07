/**
 * Generates a depth tuple of length N.
 * Depth<5> = [0, 0, 0, 0, 0]
 * Depth<3> = [0, 0, 0]
 *
 * @typeParam N - The desired depth (0-10 recommended, higher may hit recursion limits)
 * @typeParam Acc - Internal accumulator, do not provide
 */
export type Depth<
  N extends number,
  Acc extends 0[] = [],
> = Acc["length"] extends N ? Acc : Depth<N, [...Acc, 0]>;
/**
 * Decrements depth by removing the first element from the tuple.
 */
export type DecrementDepth<D extends unknown[]> = D extends [
  unknown,
  ...infer Rest,
]
  ? Rest
  : [];
/**
 * Check if depth is exhausted (tuple is empty).
 */
export type IsDepthExhausted<D extends unknown[]> = D extends [] ? true : false;

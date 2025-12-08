/**
 * Extract the fixed numeric indices from a tuple (excluding array prototype keys).
 * Uses Exclude to filter out inherited array methods, leaving only tuple-specific indices.
 * [string, ...number[]] -> "0"
 * [string, boolean, ...number[]] -> "0" | "1"
 * string[] -> never
 */
export type TupleKeys<T> = T extends readonly unknown[]
  ? Exclude<keyof T, keyof unknown[]>
  : never;

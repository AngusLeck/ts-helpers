/**
 * Convert a string to a number literal type.
 * "0" -> 0, "1" -> 1, etc.
 */
type ToNumber<S extends string> = S extends `${infer N extends number}`
  ? N
  : never;

/**
 * Extract the fixed numeric indices from a tuple (excluding array prototype keys).
 * [string, ...number[]] -> "0"
 * [string, boolean, ...number[]] -> "0" | "1"
 * string[] -> never
 */
type TupleKeys<T> = T extends readonly unknown[]
  ? Exclude<keyof T, keyof unknown[]>
  : never;

/**
 * Check if K is a fixed index in tuple T (not part of the rest portion).
 */
type IsFixedIndex<T extends readonly unknown[], K extends string> =
  K extends TupleKeys<T> ? true : false;

/**
 * Can't simply use T[K] because if T is a union type, then K may not be a key,
 * when really we want to just treat it as an optional key.
 */
export type GetKey<T, K extends string | number> = T extends readonly unknown[]
  ? number extends T["length"]
    ? // Dynamic array or rest tuple - use direct index access
      ToNumber<K & string> extends keyof T
      ? IsFixedIndex<T, K & string> extends true
        ? T[ToNumber<K & string>] // Fixed position
        : T[ToNumber<K & string>] | undefined // Rest position
      : T[number] | undefined // Fallback
    : // Fixed-length tuple
      ToNumber<K & string> extends keyof T
      ? undefined extends T[ToNumber<K & string>]
        ? T[ToNumber<K & string>] | undefined // Optional element
        : T[ToNumber<K & string>] // Required element
      : never
  : T extends { [k in K]: infer V }
    ? V
    : T extends { [k in K]?: infer V }
      ? V | undefined
      : undefined;

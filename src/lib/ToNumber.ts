/**
 * Convert a string to a number literal type.
 * "0" -> 0, "1" -> 1, etc.
 */
export type ToNumber<T> = T extends number
  ? T
  : T extends `${infer N extends number}`
    ? N
    : never;

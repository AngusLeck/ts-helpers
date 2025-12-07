/**
 * Check if T has a string index signature.
 * { [key: string]: any } -> true
 * { foo: string } -> false
 */
export type HasStringIndex<T> = string extends keyof T ? true : false;

/**
 * Check if T has a number index signature.
 * { [key: number]: any } -> true
 * { 0: string } -> false
 */
export type HasNumberIndex<T> = number extends keyof T ? true : false;

/**
 * Get only the explicit (literal) string keys, excluding index signatures.
 * { foo: string; [key: string]: any } -> "foo"
 */
export type ExplicitKeys<T> = keyof T extends infer K
  ? K extends string
    ? string extends K
      ? never
      : K
    : K extends number
      ? number extends K
        ? never
        : `${K}`
      : never
  : never;

/**
 * Returns "<string>" if T has a string index signature and "<string>" is not already a key.
 */
export type StringIndexPlaceholder<T> =
  HasStringIndex<T> extends true
    ? "<string>" extends keyof T
      ? never
      : "<string>"
    : never;

/**
 * Returns "<number>" if T has a number index signature and "<number>" is not already a key.
 */
export type NumberIndexPlaceholder<T> =
  HasNumberIndex<T> extends true
    ? "<number>" extends keyof T
      ? never
      : "<number>"
    : never;

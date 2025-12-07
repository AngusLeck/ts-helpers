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
 * Get only the explicit (literal) keys, excluding index signatures.
 * For objects with index signatures, this returns never since explicit keys
 * are absorbed into the index signature type in keyof T.
 *
 * Examples:
 * { foo: string } -> "foo"
 * { foo: string; bar: number } -> "foo" | "bar"
 * { [key: string]: any } -> never
 * { [key: string]: any; known: string } -> never (limitation: "known" is absorbed by string)
 * { 0: string; 1: number } -> "0" | "1"
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
 * Returns "<string>" if T has a string index signature and "<string>" is not already an explicit key.
 * We check if "<string>" is an explicit key by seeing if it's excluded when we filter out the index signature.
 */
export type StringIndexPlaceholder<T> =
  HasStringIndex<T> extends true
    ? "<string>" extends ExplicitKeys<T>
      ? never // "<string>" is already an explicit key
      : "<string>"
    : never;

/**
 * Returns "<number>" if T has a number index signature and "<number>" is not already an explicit key.
 */
export type NumberIndexPlaceholder<T> =
  HasNumberIndex<T> extends true
    ? "<number>" extends ExplicitKeys<T>
      ? never // "<number>" is already an explicit key
      : "<number>"
    : never;

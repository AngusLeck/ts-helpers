/**
 * Get only the explicit (literal) keys, excluding index signatures.
 * String index signatures absorb all explicit string keys in keyof T.
 */
export type ExplicitKeys<T> = {
  [K in keyof T]: K extends string
    ? string extends K
      ? never
      : K
    : K extends number
      ? number extends K
        ? never
        : `${K}`
      : never;
}[keyof T];

/** Returns "<string>" if T has a string index signature. */
export type StringIndexPlaceholder<T> = string extends keyof T
  ? "<string>"
  : never;

/**
 * Returns "0" if T has an explicit number index (not implied by string index).
 * String index implies number index, so only returns "0" for number-only signatures.
 */
export type NumberIndexPlaceholder<T> = number extends keyof T
  ? string extends keyof T
    ? never
    : "0"
  : never;

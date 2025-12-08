/**
 * Matches any primitive value.
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Primitive
 */
type Primitive = string | number | boolean | bigint | symbol | null | undefined;
/**
 * Built-in types that should not be recursed into.
 * Includes primitives, void, and common built-in objects.
 */
export type BuiltIn = Primitive | void | Date | RegExp | Error;

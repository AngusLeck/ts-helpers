/**
 * The full list of types that can be turned into a string
 */
type Stringable = string | number | bigint | boolean | null | undefined;

/**
 * Just works like \`${T}\` but it doesn't complain if you give it eg a symbol.
 */
export type ToString<T> = T extends Stringable ? `${T}` : undefined;

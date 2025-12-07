/**
 * Extract the element type from an array.
 */
export type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;

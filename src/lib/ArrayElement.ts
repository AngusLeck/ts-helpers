/**
 * Extract the element type from an array.
 */
export type ArrayElement<T extends readonly unknown[]> = T[number];

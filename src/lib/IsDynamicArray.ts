/**
 * Check if a type is a dynamic array (not a tuple).
 * Dynamic arrays have flexible length (number extends T["length"]).
 */
export type IsDynamicArray<T> = T extends readonly unknown[]
  ? number extends T["length"]
    ? true
    : false
  : false;

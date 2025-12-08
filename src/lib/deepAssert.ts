import { assert } from "./assert";
import { GET, get } from "./Get";
import { Narrow } from "./NarrowPath";
import { Path } from "./Path";

/**
 * Utilizes a type guard to assert the deep type of a property within a given object based on the specified path.
 * This can be useful for deeply validating the shape or type of nested properties in complex objects.
 *
 * @template T - The type of the input object to be checked.
 * @template P - The type-safe path within the object T leading to the value to be checked.
 * @template V - The type that the value at path P within object T is expected to conform to, based on the provided guard function.
 *
 * @param {T} input - The input object which will be checked.
 * @param {P} path - A path within the input object, leading to the value that will be type-checked.
 * @param {(val: GET<T, P>) => val is V} guard - A type guard function that takes the value at the specified path and returns true if the value matches the expected type V.
 *
 * @returns {input is Narrow<T, P, V>} A boolean indicating whether the input object's specified deep value conforms to type V.
 *
 */
export function deepTypeGuard<T, P extends Path<T>, V extends GET<T, P>>(
  input: T,
  path: P,
  guard: (val: GET<T, P>) => val is V,
): input is Narrow<T, P, V> {
  return guard(get(input, path));
}

/**
 * Asserts the deep type of a property within a given object according to the specified path, throwing an error if the validation fails. It is useful for deep validation with an option to fail fast by throwing errors if the nested properties don't meet the expected types.
 *
 * @template T - The type of the input object to be validated.
 * @template P - The type-safe path within object T leading to the value being asserted.
 * @template V - The type that the value at path P is expected to conform to, based on the provided guard function.
 *
 * @param {T} input - The input object to be validated.
 * @param {P} path - A path within the input object, specifying the value to be asserted.
 * @param {(val: GET<T, P>) => val is V} guard - A type guard function that validates the deep value's alignment with type V.
 * @param {string} [errorMessage] - An optional custom error message to be thrown if the assertion fails.
 *
 * @returns {asserts input is Narrow<T, P, V>} - This function returns nothing but asserts the type of the input object's deep value for TypeScript if the assertion passes. Throws an error otherwise.
 *
 */
export function deepAssert<T, P extends Path<T>, V extends GET<T, P>>(
  input: T,
  path: P,
  guard: (val: GET<T, P>) => val is V,
  errorMessage?: string,
): asserts input is Narrow<T, P, V> {
  assert(get(input, path), guard, errorMessage);
}

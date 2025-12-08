import { GET, get } from "../Get";
import { Narrow } from "../NarrowPath";
import { Path } from "../Path";

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
  path: P,
  guard: (val: GET<T, P>) => val is V,
): (input: T) => input is Narrow<T, P, V> {
  return (input): input is Narrow<T, P, V> => guard(get(input, path));
}

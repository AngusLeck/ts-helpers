import { assert } from "./assert";
import { GET, get } from "./Get";
import { Narrow } from "./NarrowPath";
import { Path } from "./Path";

export function checkPath<T, P extends Path<T>, V extends GET<T, P>>(
  input: T,
  path: P,
  guard: (val: GET<T, P>) => val is V
): input is Narrow<T, P, V> {
  return guard(get(input, path));
}

export function validatePath<T, P extends Path<T>, V extends GET<T, P>>(
  input: T,
  path: P,
  guard: (val: GET<T, P>) => val is V,
  errorMessage?: string
): asserts input is Narrow<T, P, V> {
  assert(get(input, path), guard, errorMessage);
}

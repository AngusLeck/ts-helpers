import { GET, get } from "./Get";
import { Narrow } from "./NarrowPath";
import { Path } from "./Path";

export type PathsPresent<T, P extends Path<T>> = Present<T, P>;

export type Present<T, P extends string> = Narrow<T, P, NonNullable<GET<T, P>>>;

export function pathsPresent<T, P extends Path<T>>(
  input: T,
  ...paths: P[]
): input is Present<T, P> {
  return paths.every((path) => get(input, path) != null);
}

export function assertAllPresent<T, P extends Path<T>>(
  input: T,
  ...paths: P[]
): asserts input is Present<T, P> {
  const absent = paths.filter((path) => get(input, path) == null);
  if (absent.length) {
    throw new TypeError(
      `Some required paths missing from ${JSON.stringify(
        input
      )}, absent paths: ${absent}`
    );
  }
}

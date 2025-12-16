import { get } from "../Get.js";
import { Path } from "../Path.js";
import { Present } from "../PathsPresent.js";

export function pathsPresent<T, P extends Path<T>>(
  ...paths: P[]
): (input: T) => input is Present<T, P> {
  return (input): input is Present<T, P> =>
    paths.every((path) => get(input, path) != null);
}

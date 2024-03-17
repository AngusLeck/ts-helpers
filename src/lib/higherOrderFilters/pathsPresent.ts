import { get } from "../Get";
import { Path } from "../Path";
import { Present } from "../PathsPresent";

export function pathsPresent<T, P extends Path<T>>(
  ...paths: P[]
): (input: T) => input is Present<T, P> {
  return (input): input is Present<T, P> =>
    paths.every((path) => get(input, path) != null);
}

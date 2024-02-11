import { get } from "./Get";
import { GetKey } from "./GetKey";
import { Intersection } from "./Intersection";
import { Path } from "./Path";
import { UnionToIntersection } from "./UnionToIntersection";

export type PathsPresent<T, P extends Path<T>> = Present<T, P>;

export type Present<T, P extends string> = UnionToIntersection<
  PathsPresentRecursive<T, P>
>;

type PathsPresentRecursive<T, P extends string> = UnionToIntersection<
  P extends `${infer K}.${infer R}`
    ? ReplaceKeyAndMakeNonNullable<T, K, PathsPresentRecursive<GetKey<T, K>, R>>
    : ReplaceKeyAndMakeNonNullable<T, P, GetKey<T, P>>
>;

type ReplaceKeyAndMakeNonNullable<T, K extends string, V> = Intersection<
  T,
  {
    [K1 in K]-?: NonNullable<V>;
  }
>;

export function pathsPresent<T, P extends Path<T>>(
  input: T,
  ...paths: P[]
): input is Intersection<Present<T, P>, T> {
  return paths.every((path) => get(input, path) != null);
}

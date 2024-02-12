import { GET, get } from "./Get";
import { GetKey } from "./GetKey";
import { Intersection } from "./Intersection";
import { Path } from "./Path";
import { UnionToIntersection } from "./UnionToIntersection";

export type NarrowPath<
  T,
  P extends Path<T>,
  V extends GET<T, P>
> = Intersection<PresentValue<T, P, V>, T>;

type PresentValue<T, P extends string, V> = UnionToIntersection<
  PathsPresentRecursive<T, P, V>
>;

type PathsPresentRecursive<T, P extends string, V> = UnionToIntersection<
  P extends `${infer K}.${infer R}`
    ? ReplaceKey<T, K, PathsPresentRecursive<GetKey<T, K>, R, V>>
    : ReplaceKey<T, P, V>
>;

type ReplaceKey<T, K extends string, V> = Intersection<
  T,
  {
    [K1 in K]-?: V;
  }
>;

export function validatePath<T, P extends Path<T>, V extends GET<T, P>>(
  input: T,
  path: P,
  guard: (val: GET<T, P>) => val is V
): input is NarrowPath<T, P, V> {
  return guard(get(input, path));
}

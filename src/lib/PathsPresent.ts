import { GetKey } from "./GetKey";
import { Path } from "./Path";
import { UnionToIntersection } from "./UnionToIntersection";

export type PathsPresent<T, P extends Path<T>> = UnionToIntersection<
  PathsPresentRecursive<T, P>
>;

type PathsPresentRecursive<
  T,
  P extends string
> = P extends `${infer K}.${infer R}`
  ? ReplaceKeyAndMakeNonNullable<T, K, PathsPresentRecursive<GetKey<T, K>, R>>
  : ReplaceKeyAndMakeNonNullable<T, P, GetKey<T, P>>;

type ReplaceKeyAndMakeNonNullable<T, K extends string, V> = T & {
  [K1 in K]-?: NonNullable<V>;
};

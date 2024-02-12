import { GET } from "./Get";
import { GetKey } from "./GetKey";
import { Intersection } from "./Intersection";
import { Path } from "./Path";
import { UnionToIntersection } from "./UnionToIntersection";

export type NarrowPath<T, P extends Path<T>, V extends GET<T, P>> = Narrow<
  T,
  P,
  V
>;

export type Narrow<T, P extends string, V> = Intersection<
  ReplacePath<T, P, V>,
  T
>;

type ReplacePath<T, P extends string, V> = UnionToIntersection<
  ReplacePathRecursive<T, P, V>
>;

type ReplacePathRecursive<T, P extends string, V> = UnionToIntersection<
  P extends `${infer K}.${infer R}`
    ? ReplaceKey<T, K, ReplacePathRecursive<GetKey<T, K>, R, V>>
    : ReplaceKey<T, P, V>
>;

type ReplaceKey<T, K extends string, V> = Intersection<
  T,
  {
    [K1 in K]-?: V;
  }
>;

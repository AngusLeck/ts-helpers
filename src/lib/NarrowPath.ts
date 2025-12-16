import { GET } from "./Get.js";
import { GetKey } from "./GetKey.js";
import { Intersection } from "./Intersection.js";
import { Path } from "./Path.js";
import { UnionToIntersection } from "./UnionToIntersection.js";

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

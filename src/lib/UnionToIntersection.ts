import { Collapse } from "./Collapse";

export type UnionToIntersection<U> = Collapse<
  (U extends U ? (x: U) => void : never) extends (x: infer I) => void
    ? I
    : never
>;

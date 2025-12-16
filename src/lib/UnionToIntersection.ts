import { Collapse } from "./Collapse.js";

export type UnionToIntersection<U> = Collapse<
  (U extends U ? (x: U) => void : never) extends (x: infer I) => void
    ? I
    : never
>;

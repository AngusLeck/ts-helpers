import { Obj } from "./Obj";

export type Collapse<T> = T extends Obj
  ? {
      [K in keyof T]: T[K];
    }
  : T;

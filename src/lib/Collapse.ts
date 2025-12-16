import { Obj } from "./Obj.js";

export type Collapse<T> = T extends Obj
  ? {
      [K in keyof T]: T[K];
    }
  : T;

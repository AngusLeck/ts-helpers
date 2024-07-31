import { Obj } from "./Obj";

export type FlattenedPath<T> = T extends Obj ? FlattenedPath<T[keyof T]> : T;

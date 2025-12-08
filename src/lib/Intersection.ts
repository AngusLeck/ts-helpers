export type Intersection<T, U> = [T] extends [U]
  ? T
  : [U] extends [T]
    ? U
    : T & U;

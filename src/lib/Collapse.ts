export type Collapse<T> = T extends {
  [K in keyof T]: unknown;
}
  ? {
      [K in keyof T]: Collapse<T[K]>;
    }
  : T;

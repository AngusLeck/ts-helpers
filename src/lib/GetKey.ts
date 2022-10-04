/**
 * Can't simply use T[K] because if T is a union type, then K may not be a key,
 * when really we want to just treat it as an optional key.
 */
export type GetKey<T, K extends string | number> = T extends {
  [k in K]: infer V;
}
  ? V
  : T extends {
      [k in K]?: infer V;
    }
  ? V | undefined
  : undefined;

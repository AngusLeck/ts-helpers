import { IsDepthExhausted } from "./Depth.js";
import { IsLeafType } from "./IsLeafType.js";

/** Stop if the depth is exhausted or the type is a leaf type. */
export type ShouldTerminatePathing<T, D extends unknown[]> =
  IsDepthExhausted<D> extends true
    ? true
    : IsLeafType<T> extends true
      ? true
      : false;

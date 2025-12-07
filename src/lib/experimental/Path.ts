import { ArrayElement } from "../ArrayElement";
import { DecrementDepth, Depth } from "../Depth";
import { Obj } from "../Obj";
import { PrependPath } from "../PrependPath";
import { ShouldTerminatePathing } from "../ShouldTerminatePathing";

/** Internal path builder - uses ${number} for arrays (complete but not suggestion-friendly). */
type BuildPaths<T, D extends unknown[], Prefix extends string = ""> =
  ShouldTerminatePathing<T, D> extends true
    ? never
    : T extends readonly unknown[]
      ? number extends T["length"]
        ?
            | PrependPath<Prefix, `${number}`>
            | BuildPaths<
                ArrayElement<T>,
                DecrementDepth<D>,
                PrependPath<Prefix, `${number}`>
              >
        : {
            [K in keyof T & `${number}`]:
              | PrependPath<Prefix, K>
              | BuildPaths<T[K], DecrementDepth<D>, PrependPath<Prefix, K>>;
          }[keyof T & `${number}`]
      : T extends Obj
        ? {
            [K in keyof T & string]:
              | PrependPath<Prefix, K>
              | BuildPaths<T[K], DecrementDepth<D>, PrependPath<Prefix, K>>;
          }[keyof T & string]
        : never;

/**
 * All valid dot-notation paths for type T. For IDE autocomplete, use PathSuggestions.
 */
export type Path<T, D extends unknown[] = Depth<5>> = BuildPaths<T, D> & string;

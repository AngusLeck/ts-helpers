import { ArrayElement } from "../ArrayElement";
import { DecrementDepth, Depth } from "../Depth";
import { Obj } from "../Obj";
import { PrependPath } from "../PrependPath";
import { ShouldTerminatePathing } from "../ShouldTerminatePathing";

/**
 * Internal path builder that recurses through object properties.
 * Uses ${number} for array indices - complete but not suggestion-friendly.
 */
type BuildPaths<T, D extends unknown[], Prefix extends string = ""> =
  ShouldTerminatePathing<T, D> extends true
    ? never
    : T extends readonly unknown[]
      ? number extends T["length"]
        // Dynamic array: accept any numeric index
        ? | PrependPath<Prefix, `${number}`>
          | BuildPaths<ArrayElement<T>, DecrementDepth<D>, PrependPath<Prefix, `${number}`>>
        // Tuple: only valid indices
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
 * Generates a union of all valid dot-notation paths for type T.
 * This is the complete/correct type - use for validation constraints.
 * For IDE autocomplete, use PathSuggestions instead.
 *
 * @typeParam T - The object type to generate paths for
 * @typeParam D - Depth tuple (default: Depth<5> = 5 levels)
 */
export type Path<T, D extends unknown[] = Depth<5>> = BuildPaths<T, D> & string;

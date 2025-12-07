import { ArrayElement } from "../ArrayElement";
import { DecrementDepth, Depth } from "../Depth";
import { Obj } from "../Obj";
import { PrependPath } from "../PrependPath";
import { ShouldTerminatePathing } from "../ShouldTerminatePathing";
import {
  ExplicitKeys,
  StringIndexPlaceholder,
  NumberIndexPlaceholder,
} from "./helpers/IndexHelpers";
import { HasRestElement, ExplicitTupleLength } from "./helpers/TupleHelpers";

/**
 * Build suggestions for tuple types.
 * Returns all explicit indices, plus one more if there's a rest element.
 */
type BuildTupleSuggestions<
  T extends readonly unknown[],
  D extends unknown[],
  Prefix extends string,
> =
  | {
      [K in keyof T & `${number}`]:
        | PrependPath<Prefix, K>
        | BuildSuggestions<T[K], DecrementDepth<D>, PrependPath<Prefix, K>>;
    }[keyof T & `${number}`]
  | (HasRestElement<T> extends true
      ? ExplicitTupleLength<T> extends number
        ?
            | PrependPath<Prefix, `${ExplicitTupleLength<T>}`>
            | BuildSuggestions<
                ArrayElement<T>,
                DecrementDepth<D>,
                PrependPath<Prefix, `${ExplicitTupleLength<T>}`>
              >
        : never
      : never);

/**
 * Internal suggestion builder that recurses through object properties.
 * Uses literal strings only - no ${number} or template literals.
 */
type BuildSuggestions<T, D extends unknown[], Prefix extends string = ""> =
  ShouldTerminatePathing<T, D> extends true
    ? never
    : T extends readonly unknown[]
      ? T extends readonly [unknown, ...unknown[]]
        ? // Tuple (may have rest): all explicit indices + one for rest if applicable
          BuildTupleSuggestions<T, D, Prefix>
        : // Dynamic array: only suggest "0"
            | PrependPath<Prefix, "0">
            | BuildSuggestions<
                ArrayElement<T>,
                DecrementDepth<D>,
                PrependPath<Prefix, "0">
              >
      : T extends Obj
        ?
            | (StringIndexPlaceholder<T> extends infer P extends string
                ? P extends never
                  ? never
                  :
                      | PrependPath<Prefix, P>
                      | BuildSuggestions<
                          T[string],
                          DecrementDepth<D>,
                          PrependPath<Prefix, P>
                        >
                : never)
            | (NumberIndexPlaceholder<T> extends infer P extends string
                ? P extends never
                  ? never
                  :
                      | PrependPath<Prefix, P>
                      | BuildSuggestions<
                          T[number],
                          DecrementDepth<D>,
                          PrependPath<Prefix, P>
                        >
                : never)
            | {
                [K in ExplicitKeys<T>]:
                  | PrependPath<Prefix, K>
                  | BuildSuggestions<
                      K extends keyof T ? T[K] : never,
                      DecrementDepth<D>,
                      PrependPath<Prefix, K>
                    >;
              }[ExplicitKeys<T>]
        : never;

/**
 * Generates a union of path suggestions for IDE autocomplete.
 * Intentionally incomplete - uses only string literals for full suggestion support.
 * For complete path validation, use Path instead.
 *
 * Rules:
 * - Arrays: suggest "0" only
 * - Tuples: all explicit indices + one for rest element
 * - Objects: explicit keys only + "<string>"/"<number>" for index signatures
 * - Unions: paths from all branches
 *
 * @typeParam T - The object type to generate suggestions for
 * @typeParam D - Depth tuple (default: Depth<5> = 5 levels)
 */
export type PathSuggestions<
  T,
  D extends unknown[] = Depth<5>,
> = BuildSuggestions<T, D> & string;

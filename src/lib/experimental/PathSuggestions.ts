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

/** Build suggestions for tuples: all explicit indices + one for rest element. */
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
      ?
          | PrependPath<Prefix, `${ExplicitTupleLength<T>}`>
          | BuildSuggestions<
              ArrayElement<T>,
              DecrementDepth<D>,
              PrependPath<Prefix, `${ExplicitTupleLength<T>}`>
            >
      : never);

/** Internal suggestion builder - uses only literal strings for IDE autocomplete. */
type BuildSuggestions<T, D extends unknown[], Prefix extends string = ""> =
  ShouldTerminatePathing<T, D> extends true
    ? never
    : T extends readonly unknown[]
      ? T extends readonly [unknown, ...unknown[]]
        ? BuildTupleSuggestions<T, D, Prefix>
        :
            | PrependPath<Prefix, "0">
            | BuildSuggestions<
                ArrayElement<T>,
                DecrementDepth<D>,
                PrependPath<Prefix, "0">
              >
      : T extends Obj
        ?
            | PrependPath<Prefix, StringIndexPlaceholder<T>>
            | BuildSuggestions<
                T[string],
                DecrementDepth<D>,
                PrependPath<Prefix, StringIndexPlaceholder<T>>
              >
            | PrependPath<Prefix, NumberIndexPlaceholder<T>>
            | BuildSuggestions<
                T[number],
                DecrementDepth<D>,
                PrependPath<Prefix, NumberIndexPlaceholder<T>>
              >
            | {
                [K in ExplicitKeys<T> & keyof T]:
                  | PrependPath<Prefix, K & string>
                  | BuildSuggestions<
                      T[K],
                      DecrementDepth<D>,
                      PrependPath<Prefix, K & string>
                    >;
              }[ExplicitKeys<T> & keyof T]
        : never;

/**
 * Path suggestions for IDE autocomplete. Uses only string literals.
 * For complete path validation, use Path instead.
 */
export type PathSuggestions<
  T,
  D extends unknown[] = Depth<5>,
> = BuildSuggestions<T, D> & string;

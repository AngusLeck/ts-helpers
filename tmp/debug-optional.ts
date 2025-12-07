import { assertEqual } from "../src/lib/testHelpers";

// Debug optional tuple elements
type T = [string, number?];

// What is the length?
type TLength = T["length"]; // 1 | 2 (not number!)

// So HasRestElement<[string, number?]> should be false
type HasRest = number extends (1 | 2) ? true : false; // false ✓

// What does ExplicitTupleLength return?
type HasRestElement<T extends readonly unknown[]> =
  number extends T["length"] ? true : false;

type ExplicitTupleLength<T extends readonly unknown[]> =
  HasRestElement<T> extends true
    ? never // ExplicitLengthCounter<T>
    : T["length"];

// For [string, number?]:
// HasRestElement = false
// So returns T["length"] = 1 | 2

type Result = ExplicitTupleLength<T>; // 1 | 2, NOT 2!

// The test expects 2, but we return 1 | 2
// This is actually correct behavior - optional elements mean variable length
// The test expectation might be wrong

// What should ExplicitTupleLength return for optional elements?
// Option A: Return the maximum possible length (2)
// Option B: Return the union of possible lengths (1 | 2)
// Option C: Only count non-optional elements (1)

// For PathSuggestions, we want to suggest ALL valid indices
// So for [string, number?], we want to suggest "0" and "1"
// This means we need to know the MAXIMUM length, which is 2

// Fix: For optional elements, we should return the max possible length
// We can detect optional by checking if length is a union

// Check if length is a union (variable length but not rest)
type IsOptionalTuple<T extends readonly unknown[]> =
  number extends T["length"]
    ? false // Has rest, not optional
    : T["length"] extends number
      ? number extends T["length"]
        ? false
        : // Check if length is a union by testing if it's a single number
          [T["length"]] extends [infer L]
          ? L extends number
            ? `${L}` extends `${number}`
              ? true // It's a specific number, but we need to check union...
              : false
            : false
          : false
      : false;

// Actually simpler approach: just use the fact that for [string, number?],
// T["length"] = 1 | 2, and we want 2 (the max)

// Get max from a union of numbers
type Max<T extends number, Current extends number = 0> =
  T extends T
    ? T extends Current
      ? Current
      : Max<Exclude<T, Current>, T extends Current ? Current : T>
    : Current;

// This is getting complex. Let me think differently.

// For our PathSuggestions use case:
// [string, number?] should suggest indices "0" and "1"
// So we need ExplicitTupleLength to return 2 (or somehow indicate both are valid)

// The problem is T["length"] = 1 | 2 for optional tuples
// And the test expects assertEqual<Result, 2> to pass
// But Result is 1 | 2, not 2

// Options:
// 1. Change the test to expect 1 | 2
// 2. Change ExplicitTupleLength to extract max from union
// 3. Change the design - maybe we don't need ExplicitTupleLength for optional tuples

// For PathSuggestions, what matters is which indices to suggest.
// If we iterate through indices 0, 1, 2, ... we should stop when the index isn't valid.
// For [string, number?], keyof T & `${number}` = "0" | "1"
// So we can use keyof directly instead of ExplicitTupleLength!

type TupleIndices = keyof T & `${number}`; // "0" | "1" ✓

// This is simpler and more direct. PathSuggestions should iterate over
// keyof T & `${number}` for tuples, rather than using ExplicitTupleLength.

// So the test expectation is arguably wrong, OR
// we should fix ExplicitTupleLength to return the max length for optional tuples

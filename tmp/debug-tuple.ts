import { assertEqual } from "../src/lib/testHelpers";

// Test what HasRestElement thinks of various tuples
type HasRest<T extends readonly unknown[]> = number extends T["length"] ? true : false;

// Regular tuple
type Test1 = HasRest<[string, number]>; // Should be false
type Test1Expected = false;
const _t1: Test1 = false as Test1Expected;

// Tuple with rest
type Test2 = HasRest<[string, ...number[]]>; // Should be true
type Test2Expected = true;
const _t2: Test2 = true as Test2Expected;

// Tuple with optional (the key question)
type Test3 = HasRest<[string, number?]>; // What is this?
type Test3Length = [string, number?]["length"]; // 1 | 2
type Test3Check = number extends (1 | 2) ? true : false; // Should be false!

// Debug the actual length types
type L1 = [string, number]["length"]; // 2
type L2 = [string, ...number[]]["length"]; // number
type L3 = [string, number?]["length"]; // 1 | 2

// So HasRestElement should return false for optional!
// Let's verify our actual types

type ActualHasRest<T extends readonly unknown[]> = number extends T["length"] ? true : false;

// Check [string, number, ...boolean[]]
type Test4 = ActualHasRest<[string, number, ...boolean[]]>;
type Test4Expected = true;

// What does our ExplicitLengthCounter produce?
type ExplicitLengthCounter<
  T extends readonly unknown[],
  Counter extends unknown[] = [],
> = T extends readonly [unknown, ...infer Rest]
  ? number extends Rest["length"]
    ? [...Counter, 0]["length"] // Rest is unbounded, count current + 1
    : ExplicitLengthCounter<Rest, [...Counter, 0]>
  : Counter["length"];

// [string, number, ...boolean[]]
// Step 1: T = [string, number, ...boolean[]], Counter = []
//   Matches [unknown, ...infer Rest] where Rest = [number, ...boolean[]]
//   number extends [number, ...boolean[]]["length"]? = number extends number? = true!
//   Returns [...[], 0]["length"] = 1  ← WRONG! Should be 2

type Debug1 = [number, ...boolean[]]["length"]; // number - so it's unbounded
type Debug2 = ExplicitLengthCounter<[string, number, ...boolean[]]>; // Returns 1, should be 2

// The problem: After extracting string, Rest = [number, ...boolean[]]
// This STILL has unbounded length! So we return 1 instead of continuing.

// The fix: We need to check if the CURRENT tuple has unbounded length,
// not the REST. If T has unbounded length but matches [unknown, ...Rest],
// we should only stop if T itself is just a rest array.

// Alternative approach: Count until we hit an index that equals T[number]
// but isn't a specific type.

// Better approach: Use the tuple's actual indices
type TupleIndices<T extends readonly unknown[]> = Exclude<keyof T, keyof unknown[]>;
type Debug3 = TupleIndices<[string, number, ...boolean[]]>; // "0" | "1"
// This gives us the explicit indices!

// But wait, let's check:
type Debug4 = keyof [string, number, ...boolean[]];
// This includes number (from array index), not just "0" | "1"

// Let me check what indices are string literals vs number
type Debug5 = keyof [string, number, ...boolean[]] & `${number}`;
// "0" | "1" | `${number}` - includes template literal

// Count string literal numeric keys
type CountLiteralKeys<T extends readonly unknown[], K = keyof T & `${number}`> =
  K extends `${infer N extends number}`
    ? N extends number
      ? never
      : never
    : never;

// Actually the issue is simpler. For [string, number, ...boolean[]]:
// - Index 0: string (explicit)
// - Index 1: number (explicit)
// - Index 2+: boolean (rest)

// We can detect this by checking if T[2] exists and equals T[number]
// Actually no, T[2] would be boolean which IS in T[number]...

// The real solution: iterate through indices 0, 1, 2, ...
// and count until we hit an index where T[Index] === T[number]
// AND the index is not in the explicit part.

// Simplest fix: Check if BOTH elements exist in the first destructure
// [string, number, ...boolean[]] destructures to:
// T = [string, number, ...boolean[]]
// After [unknown, ...infer Rest]: Rest = [number, ...boolean[]]
// After [unknown, ...infer Rest] again: Rest = [...boolean[]] which is boolean[]

// So the key is: Rest is a plain array (not a tuple with explicit elements)
// when number extends Rest["length"] AND Rest doesn't match [unknown, ...]

// Fixed algorithm:
type ExplicitLengthCounterV2<
  T extends readonly unknown[],
  Counter extends unknown[] = [],
> = T extends readonly [unknown, ...infer Rest]
  ? Rest extends readonly unknown[]
    ? number extends Rest["length"]
      ? Rest extends readonly [unknown, ...unknown[]]
        ? ExplicitLengthCounterV2<Rest, [...Counter, 0]> // Rest still has explicit elements
        : [...Counter, 0]["length"] // Rest is just a rest array, stop here
      : ExplicitLengthCounterV2<Rest, [...Counter, 0]>
    : Counter["length"]
  : Counter["length"];

type TestV2_1 = ExplicitLengthCounterV2<[string, ...number[]]>; // Should be 1
type TestV2_2 = ExplicitLengthCounterV2<[string, number, ...boolean[]]>; // Should be 2

// Let's trace TestV2_2:
// T = [string, number, ...boolean[]], Counter = []
// Matches [unknown, ...Rest] where Rest = [number, ...boolean[]]
// Rest extends readonly unknown[]? Yes
// number extends Rest["length"]? number extends number? Yes
// Rest extends [unknown, ...unknown[]]? [number, ...boolean[]] matches? Yes!
// So recurse with T = [number, ...boolean[]], Counter = [0]
//
// T = [number, ...boolean[]], Counter = [0]
// Matches [unknown, ...Rest] where Rest = [...boolean[]] = boolean[]
// Rest extends readonly unknown[]? Yes
// number extends Rest["length"]? number extends number? Yes
// Rest extends [unknown, ...unknown[]]? boolean[] matches [unknown, ...unknown[]]?
//   boolean[] does match because it's [...boolean] which is [boolean, ...boolean[]] NO WAIT
//   boolean[] is just an array, not a tuple. Does it match?
//   Let's check: boolean[] extends readonly [unknown, ...unknown[]]?
type Debug6 = boolean[] extends readonly [unknown, ...unknown[]] ? true : false; // false!
//
// So Rest = boolean[] doesn't match [unknown, ...unknown[]]
// Returns [...[0], 0]["length"] = 2 ✓

assertEqual<TestV2_2, 2>(true);

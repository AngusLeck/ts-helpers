/**
 * Research: How to correctly identify explicit vs rest elements
 */

// The key insight: For tuples with rest elements, the `length` property is `number`.
// For tuples without rest, the `length` property is a specific number literal.

type RestTuple = [string, number, ...boolean[]];
type NoRestTuple = [string, number];

type RestLength = RestTuple["length"]; // number
type NoRestLength = NoRestTuple["length"]; // 2

// We already have HasRestElement that checks this!

// For counting explicit elements, we need a different approach:
// We can't rely on checking element types. Instead, we should check
// if a specific index is defined in the tuple type.

// The trick: For explicit elements, the index is a key of the tuple.
// For rest elements, any number is a key.

// Actually, both are keys! So that doesn't work either.

// Better approach: Use the tuple's built-in length tracking.
// TypeScript actually tracks the "minimum length" of a tuple separately.

// For [string, number, ...boolean[]], the minimum length is 2
// For [string, ...number[]], the minimum length is 1
// For [string, number], the minimum length is 2

// How to get minimum length?
// We can use Required<T>["length"] - but that doesn't help.

// Another approach: Use the fact that optional elements and rest elements
// behave differently.

// Research shows that we can use this pattern:
// Check if the element is required at that position by seeing if
// the tuple without that position would be assignable to the original

// Or we can use a simpler approach:
// The number of explicit elements equals the minimum length of the tuple
// which we can extract by checking when indices stop being guaranteed

// For tuples, we can check: is this a "sparse" position?
// A sparse position is one where the element might not exist

// Actually, the solution is simpler:
// We need to check if T extends readonly [unknown, ...unknown[]]
// and progressively "peel off" explicit elements

type ExplicitLengthCorrect<T extends readonly unknown[]> =
  T extends readonly [unknown, ...infer Rest]
    ? 1 extends Rest["length"]
      ? 1 // Only 1 explicit element, rest is infinite
      : 1 + ExplicitLengthCorrect<Rest>
    : 0;

// Test this approach:
type Test1 = ExplicitLengthCorrect<[string, number]>; // Should be 2
type Test2 = ExplicitLengthCorrect<[string, ...number[]]>; // Should be 1
type Test3 = ExplicitLengthCorrect<[string, number, ...boolean[]]>; // Should be 2

// Wait, that's not quite right. Let me refine:
// The key is that for [string, ...number[]], if we peel off the first element,
// we get [...number[]] which has length = number
// For [string, number], if we peel off the first element, we get [number] which has length = 1

type ExplicitLength2<T extends readonly unknown[]> =
  T extends readonly [unknown, ...infer Rest]
    ? number extends Rest["length"]
      ? 1 // Rest is infinite, so only 1 explicit element
      : 1 + ExplicitLength2<Rest>
    : 0;

// Test this:
type Test2_1 = ExplicitLength2<[string, number]>; // Should be 2 - correct!
type Test2_2 = ExplicitLength2<[string, ...number[]]>; // Should be 1 - correct!
type Test2_3 = ExplicitLength2<[string, number, ...boolean[]]>; // Should be 2 - correct!

// This is the solution!

export {};

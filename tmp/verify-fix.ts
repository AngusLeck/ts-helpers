/**
 * Verification file to test the fixed implementation
 */

import { ExplicitTupleLength, HasRestElement } from "../src/lib/experimental/helpers/TupleHelpers";

// Test 1: Regular tuple without rest - should return full length
type Test1 = ExplicitTupleLength<[string, number]>;
const _test1: Test1 = 2; // Must be 2

// Test 2: Tuple with rest at position 1 - should return 1
type Test2 = ExplicitTupleLength<[string, ...number[]]>;
const _test2: Test2 = 1; // Must be 1

// Test 3: Tuple with 2 explicit and rest - should return 2
type Test3 = ExplicitTupleLength<[string, number, ...boolean[]]>;
const _test3: Test3 = 2; // Must be 2

// Test 4: HasRestElement on regular tuple - should be false
type Test4 = HasRestElement<[string, number]>;
const _test4: Test4 = false; // Must be false

// Test 5: HasRestElement on tuple with rest - should be true
type Test5 = HasRestElement<[string, ...number[]]>;
const _test5: Test5 = true; // Must be true

// Additional edge cases:

// Test 6: Empty tuple
type Test6 = ExplicitTupleLength<[]>;
const _test6: Test6 = 0; // Must be 0

// Test 7: Single element tuple
type Test7 = ExplicitTupleLength<[string]>;
const _test7: Test7 = 1; // Must be 1

// Test 8: Tuple with just rest
type Test8 = ExplicitTupleLength<[...number[]]>;
const _test8: Test8 = 0; // Must be 0

// Test 9: Three explicit elements with rest
type Test9 = ExplicitTupleLength<[string, number, boolean, ...symbol[]]>;
const _test9: Test9 = 3; // Must be 3

// Test 10: Tuple with optional element (no rest)
type Test10 = ExplicitTupleLength<[string, number?]>;
const _test10: Test10 = 2; // Both elements are explicit (optional is not rest)

// Test 11: HasRestElement on empty tuple
type Test11 = HasRestElement<[]>;
const _test11: Test11 = false; // Must be false

// Test 12: HasRestElement on tuple with just rest
type Test12 = HasRestElement<[...number[]]>;
const _test12: Test12 = true; // Must be true

console.log("All type assertions passed!");

export {};

/**
 * Type-only test file for TupleHelpers
 * This file should type-check without errors if the implementation is correct.
 * Any type errors will indicate bugs in the implementation.
 */

import { ExplicitTupleLength, HasRestElement } from "../src/lib/experimental/helpers/TupleHelpers";

// Test 1: ExplicitTupleLength<[string, number]> should be 2
type Test1 = ExplicitTupleLength<[string, number]>;
const test1: Test1 = 2; // Should compile
// @ts-expect-error - Test1 should be exactly 2, not 1
const test1_fail: Test1 = 1;

// Test 2: ExplicitTupleLength<[string, ...number[]]> should be 1
type Test2 = ExplicitTupleLength<[string, ...number[]]>;
const test2: Test2 = 1; // Should compile
// @ts-expect-error - Test2 should be exactly 1, not 2
const test2_fail: Test2 = 2;

// Test 3: ExplicitTupleLength<[string, number, ...boolean[]]> should be 2
type Test3 = ExplicitTupleLength<[string, number, ...boolean[]]>;
const test3: Test3 = 2; // Should compile
// @ts-expect-error - Test3 should be exactly 2, not 3
const test3_fail: Test3 = 3;

// Test 4: HasRestElement<[string, number]> should be false
type Test4 = HasRestElement<[string, number]>;
const test4: Test4 = false; // Should compile
// @ts-expect-error - Test4 should be exactly false, not true
const test4_fail: Test4 = true;

// Test 5: HasRestElement<[string, ...number[]]> should be true
type Test5 = HasRestElement<[string, ...number[]]>;
const test5: Test5 = true; // Should compile
// @ts-expect-error - Test5 should be exactly true, not false
const test5_fail: Test5 = false;

export {};

/**
 * Diagnostic file to trace through ExplicitLengthCounter logic
 */

// Test tuple: [string, ...number[]]
type TestTuple = [string, ...number[]];

// What is TestTuple[number]? It should be `string | number`
type ElementType = TestTuple[number]; // string | number

// At Counter = []
// Counter["length"] = 0
// 0 extends keyof TestTuple? YES (0 is a valid index)
// TestTuple[0] = string
// TestTuple[0] extends TestTuple[number]?
// string extends (string | number)? YES - ALWAYS TRUE!

// This is the bug! The check `T[Counter["length"]] extends T[number]` is always true
// for any valid tuple element, making it impossible to distinguish explicit elements
// from rest elements.

// What we really need to check is whether the element at this position is ONLY
// from the rest element, not from the explicit elements.

// For [string, ...number[]], we have:
// - Position 0: string (explicit)
// - Position 1+: number (from rest)

// We need a way to distinguish these. One approach:
// Check if removing this position from the tuple changes the length behavior

type RestTuple = [string, ...number[]];
type NoRestTuple = [string, number];

// For RestTuple, the length is `number` (unbounded)
// For NoRestTuple, the length is 2 (fixed)

// At position 0:
// - Both have a defined type at position 0
// At position 1:
// - RestTuple has type at position 1, and position 2, 3, ... (unbounded)
// - NoRestTuple has type at position 1, but NOT at position 2

// So we can check: if position N+1 exists, continue; otherwise stop

// But there's another issue: the current implementation checks if the NEXT position exists
// However, for [string, number, ...boolean[]], positions 0, 1, 2, 3, ... all exist!

// Let me trace through [string, number, ...boolean[]]:
// Counter = []
// Counter["length"] = 0
// 0 extends keyof Tuple? YES
// Tuple[0] = string
// string extends (string | number | boolean)? YES
// Next: [...Counter, 0]["length"] = 1
// 1 extends keyof Tuple? YES
// Recurse with Counter = [0]

// Counter = [0]
// Counter["length"] = 1
// 1 extends keyof Tuple? YES
// Tuple[1] = number
// number extends (string | number | boolean)? YES
// Next: [...Counter, 0]["length"] = 2
// 2 extends keyof Tuple? YES
// Recurse with Counter = [0, 0]

// Counter = [0, 0]
// Counter["length"] = 2
// 2 extends keyof Tuple? YES (because of rest element!)
// Tuple[2] = boolean
// boolean extends (string | number | boolean)? YES
// Next: [...Counter, 0]["length"] = 3
// 3 extends keyof Tuple? YES (because of rest element!)
// Recurse with Counter = [0, 0, 0]

// This will recurse infinitely!

// The problem is that `T[number]` includes ALL element types (explicit and rest),
// and any element at any position will extend that union.

export {};

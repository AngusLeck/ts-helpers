# Path/PathSuggestions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create two distinct path types - `Path` (complete, for validation) and `PathSuggestions` (literal-only, for IDE autocomplete) - in `src/lib/experimental/`.

**Architecture:** Both types share the same recursive traversal structure but differ in how they handle arrays and index signatures. `Path` uses `${number}` for arrays; `PathSuggestions` uses literal `"0"`. Helper types detect index signatures and tuple rest elements.

**Tech Stack:** TypeScript type-level programming. Reuses existing utilities: `Depth`, `DecrementDepth`, `ShouldTerminatePathing`, `ArrayElement`, `Obj`, `PrependPath`.

---

## Task 1: Create experimental directory and helper types

**Files:**
- Create: `src/lib/experimental/helpers/TupleHelpers.ts`
- Create: `src/lib/experimental/helpers/IndexHelpers.ts`

**Step 1: Create the experimental/helpers directory structure**

Run: `mkdir -p src/lib/experimental/helpers`

**Step 2: Write TupleHelpers.ts**

```typescript
/**
 * Check if a tuple type has a rest element.
 * [string, number] -> false
 * [string, ...number[]] -> true
 */
export type HasRestElement<T extends readonly unknown[]> =
  number extends T["length"] ? true : false;

/**
 * Get the number of explicit (non-rest) elements in a tuple.
 * For [string, number, ...boolean[]], returns 2.
 * For tuples without rest, returns the full length.
 */
export type ExplicitTupleLength<T extends readonly unknown[]> =
  HasRestElement<T> extends true
    ? ExplicitLengthCounter<T>
    : T["length"];

/**
 * Count explicit elements by iterating until we hit the rest element.
 * Uses a counter tuple that grows until we can't index anymore.
 */
type ExplicitLengthCounter<
  T extends readonly unknown[],
  Counter extends unknown[] = [],
> = Counter["length"] extends keyof T
  ? T[Counter["length"]] extends T[number]
    ? // Check if this position is part of rest by seeing if next position exists
      [...Counter, 0]["length"] extends keyof T
      ? ExplicitLengthCounter<T, [...Counter, 0]>
      : [...Counter, 0]["length"]
    : Counter["length"]
  : Counter["length"];
```

**Step 3: Write IndexHelpers.ts**

```typescript
/**
 * Check if T has a string index signature.
 * { [key: string]: any } -> true
 * { foo: string } -> false
 */
export type HasStringIndex<T> = string extends keyof T ? true : false;

/**
 * Check if T has a number index signature.
 * { [key: number]: any } -> true
 * { 0: string } -> false
 */
export type HasNumberIndex<T> = number extends keyof T ? true : false;

/**
 * Get only the explicit (literal) string keys, excluding index signatures.
 * { foo: string; [key: string]: any } -> "foo"
 */
export type ExplicitKeys<T> = keyof T extends infer K
  ? K extends string
    ? string extends K
      ? never
      : K
    : K extends number
      ? number extends K
        ? never
        : `${K}`
      : never
  : never;

/**
 * Returns "<string>" if T has a string index signature and "<string>" is not already a key.
 */
export type StringIndexPlaceholder<T> =
  HasStringIndex<T> extends true
    ? "<string>" extends keyof T
      ? never
      : "<string>"
    : never;

/**
 * Returns "<number>" if T has a number index signature and "<number>" is not already a key.
 */
export type NumberIndexPlaceholder<T> =
  HasNumberIndex<T> extends true
    ? "<number>" extends keyof T
      ? never
      : "<number>"
    : never;
```

**Step 4: Commit**

```bash
git add src/lib/experimental/
git commit -m "feat(experimental): add tuple and index signature helper types"
```

---

## Task 2: Create Path type (complete, no suggestion hacks)

**Files:**
- Create: `src/lib/experimental/Path.ts`

**Step 1: Write Path.ts**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/lib/experimental/Path.ts
git commit -m "feat(experimental): add Path type without suggestion hacks"
```

---

## Task 3: Create Path type tests

**Files:**
- Create: `src/lib/experimental/Path.type.test.ts`

**Step 1: Write Path.type.test.ts**

```typescript
import { Depth } from "../Depth";
import { assertEqual, assertExtends } from "../testHelpers";
import { Path } from "./Path";

/**
 * Test model covering key path scenarios.
 */
interface TestModel {
  name: string;
  settings: {
    theme: string;
    nested: { deep: boolean };
  };
  tags: string[];
  users: { id: number; name: string }[];
  coords: [number, number];
  tupleWithRest: [string, ...number[]];
  indexed: { [key: string]: number; known: number };
  numIndexed: { [key: number]: string };
}

describe("experimental/Path", () => {
  describe("simple properties", () => {
    it("includes top-level properties", () => {
      assertExtends<"name", Path<TestModel>>(true);
      assertExtends<"settings", Path<TestModel>>(true);
    });

    it("includes nested properties", () => {
      assertExtends<"settings.theme", Path<TestModel>>(true);
      assertExtends<"settings.nested.deep", Path<TestModel>>(true);
    });
  });

  describe("dynamic arrays", () => {
    it("accepts any numeric index", () => {
      assertExtends<"tags.0", Path<TestModel>>(true);
      assertExtends<"tags.1", Path<TestModel>>(true);
      assertExtends<"tags.99", Path<TestModel>>(true);
    });

    it("accepts nested paths through any index", () => {
      assertExtends<"users.0.id", Path<TestModel>>(true);
      assertExtends<"users.42.name", Path<TestModel>>(true);
    });
  });

  describe("tuples", () => {
    it("accepts valid tuple indices", () => {
      assertExtends<"coords.0", Path<TestModel>>(true);
      assertExtends<"coords.1", Path<TestModel>>(true);
    });

    it("rejects invalid tuple indices", () => {
      assertExtends<"coords.2", Path<TestModel>>(false);
      assertExtends<"coords.99", Path<TestModel>>(false);
    });

    it("handles tuples with rest elements", () => {
      assertExtends<"tupleWithRest.0", Path<TestModel>>(true);
      assertExtends<"tupleWithRest.1", Path<TestModel>>(true);
      assertExtends<"tupleWithRest.99", Path<TestModel>>(true);
    });
  });

  describe("index signatures", () => {
    it("accepts any string key for string index", () => {
      assertExtends<"indexed.known", Path<TestModel>>(true);
      assertExtends<"indexed.anything", Path<TestModel>>(true);
      assertExtends<"indexed.foo", Path<TestModel>>(true);
    });

    it("accepts any numeric key for number index", () => {
      assertExtends<"numIndexed.0", Path<TestModel>>(true);
      assertExtends<"numIndexed.123", Path<TestModel>>(true);
    });
  });

  describe("depth limit", () => {
    interface DeepObj {
      a: { b: { c: { d: string } } };
    }

    it("stops at specified depth", () => {
      type Paths = Path<DeepObj, Depth<2>>;
      type Expected = "a" | "a.b";
      assertEqual<Paths, Expected>(true);
    });
  });

  describe("unions", () => {
    type Union = { a: string } | { b: number };

    it("includes paths from all branches", () => {
      assertExtends<"a", Path<Union>>(true);
      assertExtends<"b", Path<Union>>(true);
    });
  });
});
```

**Step 2: Run tests to verify they pass**

Run: `yarn test src/lib/experimental/Path.type.test.ts`
Expected: All tests pass

**Step 3: Commit**

```bash
git add src/lib/experimental/Path.type.test.ts
git commit -m "test(experimental): add Path type tests"
```

---

## Task 4: Create PathSuggestions type

**Files:**
- Create: `src/lib/experimental/PathSuggestions.ts`

**Step 1: Write PathSuggestions.ts**

```typescript
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
import { HasRestElement } from "./helpers/TupleHelpers";

/**
 * Build suggestions for tuple types.
 * Returns all explicit indices, plus one more if there's a rest element.
 */
type BuildTupleSuggestions<
  T extends readonly unknown[],
  D extends unknown[],
  Prefix extends string,
  Index extends unknown[] = [],
> = Index["length"] extends keyof T & `${number}`
  ? // This index is valid
    | PrependPath<Prefix, `${Index["length"]}`>
    | BuildSuggestions<T[Index["length"]], DecrementDepth<D>, PrependPath<Prefix, `${Index["length"]}`>>
    | BuildTupleSuggestions<T, D, Prefix, [...Index, 0]>
  : // Index is past explicit elements - add one more if has rest
    HasRestElement<T> extends true
      ? | PrependPath<Prefix, `${Index["length"]}`>
        | BuildSuggestions<ArrayElement<T>, DecrementDepth<D>, PrependPath<Prefix, `${Index["length"]}`>>
      : never;

/**
 * Build suggestions for object types.
 * Only includes explicit keys, plus placeholders for index signatures.
 */
type BuildObjectSuggestions<
  T extends Obj,
  D extends unknown[],
  Prefix extends string,
> =
  | StringIndexPlaceholder<T> extends infer P extends string
    ? P extends never
      ? never
      : | PrependPath<Prefix, P>
        | BuildSuggestions<T[string], DecrementDepth<D>, PrependPath<Prefix, P>>
    : never
  | NumberIndexPlaceholder<T> extends infer P extends string
    ? P extends never
      ? never
      : | PrependPath<Prefix, P>
        | BuildSuggestions<T[number], DecrementDepth<D>, PrependPath<Prefix, P>>
    : never
  | {
      [K in ExplicitKeys<T>]:
        | PrependPath<Prefix, K>
        | BuildSuggestions<
            K extends keyof T ? T[K] : never,
            DecrementDepth<D>,
            PrependPath<Prefix, K>
          >;
    }[ExplicitKeys<T>];

/**
 * Internal suggestion builder that recurses through object properties.
 * Uses literal strings only - no ${number} or template literals.
 */
type BuildSuggestions<T, D extends unknown[], Prefix extends string = ""> =
  ShouldTerminatePathing<T, D> extends true
    ? never
    : T extends readonly unknown[]
      ? number extends T["length"]
        // Dynamic array: only suggest "0"
        ? | PrependPath<Prefix, "0">
          | BuildSuggestions<ArrayElement<T>, DecrementDepth<D>, PrependPath<Prefix, "0">>
        // Tuple: all explicit indices + one for rest
        : BuildTupleSuggestions<T, D, Prefix>
      : T extends Obj
        ? BuildObjectSuggestions<T, D, Prefix>
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
export type PathSuggestions<T, D extends unknown[] = Depth<5>> =
  BuildSuggestions<T, D> & string;
```

**Step 2: Commit**

```bash
git add src/lib/experimental/PathSuggestions.ts
git commit -m "feat(experimental): add PathSuggestions type for IDE autocomplete"
```

---

## Task 5: Create PathSuggestions type tests

**Files:**
- Create: `src/lib/experimental/PathSuggestions.type.test.ts`

**Step 1: Write PathSuggestions.type.test.ts**

```typescript
import { Depth } from "../Depth";
import { assertEqual, assertExtends } from "../testHelpers";
import { PathSuggestions } from "./PathSuggestions";

/**
 * Verify that a type contains only string literals (no string, ${number}, etc).
 * Compiles only if T is a union of string literals.
 */
type AssertAllLiterals<T extends string> = string extends T ? never : T;

/**
 * Test model for suggestion scenarios.
 */
interface TestModel {
  name: string;
  settings: {
    theme: string;
    nested: { deep: boolean };
  };
  tags: string[];
  users: { id: number; name: string }[];
  coords: [number, number];
  tupleWithRest: [string, number, ...boolean[]];
  indexed: { [key: string]: number; known: number };
  numIndexed: { [key: number]: string };
}

describe("experimental/PathSuggestions", () => {
  describe("produces only literals", () => {
    it("contains no broad string types", () => {
      // This line will fail to compile if PathSuggestions contains string or ${number}
      type _Verify = AssertAllLiterals<PathSuggestions<TestModel>>;
    });
  });

  describe("simple properties", () => {
    it("includes top-level properties", () => {
      assertExtends<"name", PathSuggestions<TestModel>>(true);
      assertExtends<"settings", PathSuggestions<TestModel>>(true);
    });

    it("includes nested properties", () => {
      assertExtends<"settings.theme", PathSuggestions<TestModel>>(true);
      assertExtends<"settings.nested.deep", PathSuggestions<TestModel>>(true);
    });
  });

  describe("dynamic arrays", () => {
    it("suggests only '0' for arrays", () => {
      assertExtends<"tags.0", PathSuggestions<TestModel>>(true);
    });

    it("does not suggest other indices", () => {
      assertExtends<"tags.1", PathSuggestions<TestModel>>(false);
      assertExtends<"tags.99", PathSuggestions<TestModel>>(false);
    });

    it("suggests nested paths through '0'", () => {
      assertExtends<"users.0.id", PathSuggestions<TestModel>>(true);
      assertExtends<"users.0.name", PathSuggestions<TestModel>>(true);
    });

    it("does not suggest nested paths through other indices", () => {
      assertExtends<"users.1.id", PathSuggestions<TestModel>>(false);
    });
  });

  describe("tuples", () => {
    it("suggests all explicit indices", () => {
      assertExtends<"coords.0", PathSuggestions<TestModel>>(true);
      assertExtends<"coords.1", PathSuggestions<TestModel>>(true);
    });

    it("does not suggest invalid indices", () => {
      assertExtends<"coords.2", PathSuggestions<TestModel>>(false);
    });
  });

  describe("tuples with rest", () => {
    it("suggests all explicit indices", () => {
      assertExtends<"tupleWithRest.0", PathSuggestions<TestModel>>(true);
      assertExtends<"tupleWithRest.1", PathSuggestions<TestModel>>(true);
    });

    it("suggests one additional index for rest element", () => {
      assertExtends<"tupleWithRest.2", PathSuggestions<TestModel>>(true);
    });

    it("does not suggest indices beyond rest representative", () => {
      assertExtends<"tupleWithRest.3", PathSuggestions<TestModel>>(false);
      assertExtends<"tupleWithRest.99", PathSuggestions<TestModel>>(false);
    });
  });

  describe("index signatures", () => {
    it("suggests explicit keys", () => {
      assertExtends<"indexed.known", PathSuggestions<TestModel>>(true);
    });

    it("suggests <string> placeholder for string index", () => {
      assertExtends<"indexed.<string>", PathSuggestions<TestModel>>(true);
    });

    it("suggests <number> placeholder for number index", () => {
      assertExtends<"numIndexed.<number>", PathSuggestions<TestModel>>(true);
    });

    it("does not suggest arbitrary keys", () => {
      assertExtends<"indexed.arbitrary", PathSuggestions<TestModel>>(false);
      assertExtends<"numIndexed.123", PathSuggestions<TestModel>>(false);
    });
  });

  describe("index signature placeholder collision", () => {
    interface WithCollision {
      "<string>": number;
      other: string;
      [key: string]: string | number;
    }

    it("does not suggest <string> if already a key", () => {
      assertExtends<"<string>", PathSuggestions<WithCollision>>(true); // as explicit key
      // The placeholder logic should not add a duplicate
    });
  });

  describe("unions", () => {
    type Union = { a: string } | { b: number };

    it("includes paths from all branches", () => {
      assertExtends<"a", PathSuggestions<Union>>(true);
      assertExtends<"b", PathSuggestions<Union>>(true);
    });
  });

  describe("depth limit", () => {
    interface DeepObj {
      a: { b: { c: { d: string } } };
    }

    it("stops at specified depth", () => {
      type Suggestions = PathSuggestions<DeepObj, Depth<2>>;
      type Expected = "a" | "a.b";
      assertEqual<Suggestions, Expected>(true);
    });
  });
});
```

**Step 2: Run tests to verify they pass**

Run: `yarn test src/lib/experimental/PathSuggestions.type.test.ts`
Expected: All tests pass

**Step 3: Commit**

```bash
git add src/lib/experimental/PathSuggestions.type.test.ts
git commit -m "test(experimental): add PathSuggestions type tests"
```

---

## Task 6: Create barrel export and verify all tests pass

**Files:**
- Create: `src/lib/experimental/index.ts`

**Step 1: Write index.ts**

```typescript
export { Path } from "./Path";
export { PathSuggestions } from "./PathSuggestions";
export * from "./helpers/TupleHelpers";
export * from "./helpers/IndexHelpers";
```

**Step 2: Run all experimental tests**

Run: `yarn test src/lib/experimental/`
Expected: All tests pass

**Step 3: Run type check**

Run: `yarn tsc --noEmit`
Expected: No type errors

**Step 4: Commit**

```bash
git add src/lib/experimental/index.ts
git commit -m "feat(experimental): add barrel export for experimental types"
```

---

## Task 7: Edge case iteration - identify and fix issues

**Files:**
- Modify: `src/lib/experimental/Path.type.test.ts`
- Modify: `src/lib/experimental/PathSuggestions.type.test.ts`
- Potentially modify implementation files

**Step 1: Add edge case tests to both test files**

Add these test cases to explore edge cases:

```typescript
// Add to both test files
describe("edge cases", () => {
  // Optional properties
  interface WithOptional {
    required: string;
    optional?: number;
  }

  it("handles optional properties", () => {
    assertExtends<"required", Path<WithOptional>>(true);
    assertExtends<"optional", Path<WithOptional>>(true);
  });

  // Readonly arrays
  interface WithReadonly {
    items: readonly string[];
  }

  it("handles readonly arrays", () => {
    assertExtends<"items.0", Path<WithReadonly>>(true);
  });

  // Empty object
  interface Empty {}

  it("handles empty objects", () => {
    type Paths = Path<Empty>;
    assertEqual<Paths, never>(true);
  });

  // Nullable chains
  interface WithNull {
    maybe: { value: string } | null;
  }

  it("handles nullable properties", () => {
    assertExtends<"maybe", Path<WithNull>>(true);
    assertExtends<"maybe.value", Path<WithNull>>(true);
  });

  // Deeply nested arrays
  interface NestedArrays {
    matrix: string[][];
  }

  it("handles nested arrays", () => {
    assertExtends<"matrix.0", Path<NestedArrays>>(true);
    assertExtends<"matrix.0.0", Path<NestedArrays>>(true);
  });
});
```

**Step 2: Run tests and iterate**

Run: `yarn test src/lib/experimental/`

Fix any failing tests by adjusting the implementation.

**Step 3: Commit fixes**

```bash
git add src/lib/experimental/
git commit -m "fix(experimental): handle edge cases in Path and PathSuggestions"
```

---

## Task 8: Simplification pass

**Files:**
- Review and potentially simplify all files in `src/lib/experimental/`

**Step 1: Review for simplification opportunities**

Look for:
- Redundant type conditionals
- Over-complicated inference patterns
- Opportunities to merge similar logic

**Step 2: Run tests after each simplification**

Run: `yarn test src/lib/experimental/`
Expected: All tests still pass

**Step 3: Commit simplifications**

```bash
git add src/lib/experimental/
git commit -m "refactor(experimental): simplify Path and PathSuggestions implementations"
```

---

## Summary

After completing all tasks, you will have:

```
src/lib/experimental/
├── index.ts                      # Barrel export
├── Path.ts                       # Complete path type (uses ${number})
├── Path.type.test.ts             # Path tests
├── PathSuggestions.ts            # Suggestion-friendly type (literals only)
├── PathSuggestions.type.test.ts  # PathSuggestions tests
└── helpers/
    ├── TupleHelpers.ts           # HasRestElement, ExplicitTupleLength
    └── IndexHelpers.ts           # ExplicitKeys, placeholders
```

Next steps after validation:
1. Compare with existing `Path` implementation
2. Test IDE autocomplete behavior manually
3. Replace originals when satisfied

# Design: Separating Path and PathSuggestions

## Problem

TypeScript IDE suggestions break when a union contains broad types like `string` or template literals like `` `${number}` ``. For example:

- `"1"` gives suggestions
- `"1" | string` does not

The current `Path` type uses hacks like `"0" | (string & {})` (via `ArrayIndex`) to work around this, but it's fragile and hard to reason about.

## Solution

Split path generation into two distinct types:

| Type | Purpose | Suggestions | Completeness |
|------|---------|-------------|--------------|
| `Path<T>` | Constraint/validation | No (uses `${number}`) | Complete |
| `PathSuggestions<T>` | IDE autocomplete | Yes (literals only) | Intentionally incomplete |

Used together via function overloads:

```typescript
function get<T, P extends PathSuggestions<T>>(obj: T, path: P): Get<T, P>;
function get<T, P extends Path<T>>(obj: T, path: P): Get<T, P>;
```

## PathSuggestions Rules

### Arrays
- Suggest only `"0"` as representative index
- Recurse through `"0"` for nested paths

### Tuples
- Suggest all explicit indices
- For rest elements (e.g., `[string, ...number[]]`), add one extra index as representative

### Objects
- Suggest only explicit (literal) keys
- Ignore index signatures for key suggestions
- Add `"<string>"` or `"<number>"` placeholder if:
  - Object has corresponding index signature
  - Placeholder isn't already an explicit key

### Unions
- Include paths from all branches (maximizes discoverability)

### Index Signatures
- `Path`: includes all index signature paths
- `PathSuggestions`: uses `"<string>"`/`"<number>"` placeholder only

## File Structure

```
src/lib/experimental/
├── Path.ts                    # Complete paths (no suggestion hacks)
├── PathSuggestions.ts         # Curated literal-only paths
├── helpers/
│   ├── TupleHelpers.ts        # ExplicitTupleLength, HasRestElement
│   └── IndexHelpers.ts        # HasStringIndex, ExplicitKeys, placeholders
├── Path.test.ts               # Type tests for Path
└── PathSuggestions.test.ts    # Type tests for PathSuggestions
```

## Implementation

### Path (Complete)

```typescript
type BuildPaths<T, D extends unknown[], Prefix extends string = ""> =
  ShouldTerminatePathing<T, D> extends true
    ? never
    : T extends readonly unknown[]
      ? number extends T["length"]
        // Dynamic array: accept any numeric index
        ? `${Prefix}${number}` | BuildPaths<ArrayElement<T>, DecrementDepth<D>, `${Prefix}${number}.`>
        // Tuple: only valid indices
        : { [K in keyof T & `${number}`]:
            | `${Prefix}${K}`
            | BuildPaths<T[K], DecrementDepth<D>, `${Prefix}${K}.`>
          }[keyof T & `${number}`]
      : T extends Obj
        ? { [K in keyof T & string]:
            | `${Prefix}${K}`
            | BuildPaths<T[K], DecrementDepth<D>, `${Prefix}${K}.`>
          }[keyof T & string]
        : never;

export type Path<T, D extends unknown[] = Depth<5>> = BuildPaths<T, D> & string;
```

### PathSuggestions (Curated)

```typescript
type BuildSuggestions<T, D extends unknown[], Prefix extends string = ""> =
  ShouldTerminatePathing<T, D> extends true
    ? never
    : T extends readonly unknown[]
      ? number extends T["length"]
        // Dynamic array: only suggest "0"
        ? `${Prefix}0` | BuildSuggestions<ArrayElement<T>, DecrementDepth<D>, `${Prefix}0.`>
        // Tuple: explicit indices + one for rest
        : BuildTupleSuggestions<T, D, Prefix>
      : T extends Obj
        // Object: explicit keys + index signature placeholder
        ? BuildObjectSuggestions<T, D, Prefix>
        : never;

export type PathSuggestions<T, D extends unknown[] = Depth<5>> = BuildSuggestions<T, D> & string;
```

### Helper Types

**Tuple helpers:**
```typescript
type HasRestElement<T extends readonly unknown[]> =
  number extends T["length"] ? true : false;
```

**Index signature helpers:**
```typescript
type HasStringIndex<T> = string extends keyof T ? true : false;
type HasNumberIndex<T> = number extends keyof T ? true : false;

type ExplicitKeys<T> = keyof T extends infer K
  ? K extends string
    ? string extends K ? never : K
    : never
  : never;

type StringIndexPlaceholder<T> =
  "<string>" extends keyof T ? never : "<string>";
```

## Testing Strategy

### Path tests (correctness)
- Accepts all valid paths including `"items.123"`
- Rejects invalid paths
- Handles depth limits
- Works with unions, tuples, index signatures

### PathSuggestions tests (suggestion-friendliness)
- Output is only string literals (no `${number}`, no `string`)
- Arrays produce exactly `"0"`
- Tuples produce explicit indices + one for rest
- Index signatures produce placeholder (if not taken)
- Unions include all branches

### Suggestion verification
```typescript
// Verify no broad types leaked in
type AssertAllLiterals<T extends string> =
  string extends T ? never : T;

// Should compile if PathSuggestions only has literals
type _Test = AssertAllLiterals<PathSuggestions<MyType>>;
```

## Iteration Plan

1. Build core functionality
2. Test both types
3. Identify edge cases
4. Simplify for readability/performance
5. Replace originals when satisfied

import { Depth } from "../Depth";
import { assertEqual, assertExtends } from "../testHelpers";
import { Path } from "./Path";
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
      // PathSuggestions should only contain string literals, not string or ${number}
      // The AssertAllLiterals check below will cause a compile error if violated
      type Suggestions = PathSuggestions<TestModel>;
      type _Check = AssertAllLiterals<Suggestions>;
      // Force usage to avoid unused type error
      const verify: _Check extends never ? false : true = true;
      verify; // Reference to avoid unused variable warning
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
    it("suggests <string> placeholder for string index", () => {
      assertExtends<"indexed.<string>", PathSuggestions<TestModel>>(true);
    });

    it("suggests '0' for number index (a valid path)", () => {
      assertExtends<"numIndexed.0", PathSuggestions<TestModel>>(true);
    });

    it("does not suggest arbitrary keys", () => {
      assertExtends<"indexed.arbitrary", PathSuggestions<TestModel>>(false);
      assertExtends<"indexed.known", PathSuggestions<TestModel>>(false); // absorbed by index signature
      assertExtends<"numIndexed.1", PathSuggestions<TestModel>>(false); // only "0" is suggested
      assertExtends<"numIndexed.123", PathSuggestions<TestModel>>(false);
    });

    it("does NOT suggest '0' for string index (number is implied, redundant)", () => {
      // String index implies number index in TypeScript, but we don't want to
      // suggest "0" when there's already "<string>" - it would be redundant
      assertExtends<"indexed.0", PathSuggestions<TestModel>>(false);
    });

    // Test nested paths through index signatures
    it("suggests nested paths through string index placeholder", () => {
      type WithNestedString = { data: { [key: string]: { value: number } } };
      assertExtends<"data.<string>.value", PathSuggestions<WithNestedString>>(
        true,
      );
    });

    it("suggests nested paths through number index placeholder", () => {
      type WithNestedNumber = { data: { [key: number]: { value: number } } };
      assertExtends<"data.0.value", PathSuggestions<WithNestedNumber>>(true);
    });
  });

  describe("index signature placeholder collision", () => {
    interface WithStringCollision {
      "<string>": number;
      other: string;
      [key: string]: string | number;
    }

    it("does not suggest <string> if already a key", () => {
      assertExtends<"<string>", PathSuggestions<WithStringCollision>>(true); // as explicit key
      // The placeholder logic should not add a duplicate
    });

    interface WithNumberCollision {
      0: string;
      [key: number]: string;
    }

    it("suggests 0 for number index (explicit 0 is absorbed by index signature)", () => {
      // When { 0: string; [key: number]: string }, the explicit "0" is absorbed
      // by the number index signature in keyof, so we just get "0" from the placeholder
      assertExtends<"0", PathSuggestions<WithNumberCollision>>(true);
    });
  });

  describe("explicit keys with index signatures", () => {
    // String-form numeric keys like "0", "1" coexist with number index signatures
    interface WithStringNumericKeys {
      "0": number;
      "1": number;
      [key: number]: number;
    }

    it("suggests string-form numeric keys (not absorbed by number index)", () => {
      // String keys "0" and "1" are NOT absorbed by [key: number] - they coexist!
      // keyof { "0": number; [key: number]: number } = number | "0"
      assertExtends<"0", PathSuggestions<WithStringNumericKeys>>(true);
      assertExtends<"1", PathSuggestions<WithStringNumericKeys>>(true);
    });

    // String keys ARE absorbed by string index signatures
    interface WithStringKeys {
      known: "hello";
      [key: string]: string;
    }

    it("cannot suggest string keys absorbed by string index signature", () => {
      // keyof { known: "hello"; [key: string]: string } = string (absorbed)
      assertExtends<"known", PathSuggestions<WithStringKeys>>(false);
      assertExtends<"<string>", PathSuggestions<WithStringKeys>>(true);
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

  describe("edge cases", () => {
    // Optional properties
    interface WithOptional {
      required: string;
      optional?: number;
    }

    it("handles optional properties", () => {
      assertExtends<"required", PathSuggestions<WithOptional>>(true);
      assertExtends<"optional", PathSuggestions<WithOptional>>(true);
    });

    // Readonly arrays
    interface WithReadonly {
      items: readonly string[];
    }

    it("handles readonly arrays", () => {
      assertExtends<"items.0", PathSuggestions<WithReadonly>>(true);
    });

    // Empty object - object with no keys
    // eslint-disable-next-line @typescript-eslint/ban-types
    type Empty = {};

    it("handles empty objects", () => {
      type Paths = PathSuggestions<Empty>;
      // Empty object {} has no keys, so it returns never
      assertEqual<Paths, never>(true);
    });

    // Nullable chains
    interface WithNull {
      maybe: { value: string } | null;
    }

    it("handles nullable properties", () => {
      assertExtends<"maybe", PathSuggestions<WithNull>>(true);
      assertExtends<"maybe.value", PathSuggestions<WithNull>>(true);
    });

    // Deeply nested arrays
    interface NestedArrays {
      matrix: string[][];
    }

    it("handles nested arrays", () => {
      assertExtends<"matrix.0", PathSuggestions<NestedArrays>>(true);
      assertExtends<"matrix.0.0", PathSuggestions<NestedArrays>>(true);
    });

    // Readonly tuples
    interface WithReadonlyTuple {
      point: readonly [number, number, number];
    }

    it("handles readonly tuples", () => {
      assertExtends<"point.0", PathSuggestions<WithReadonlyTuple>>(true);
      assertExtends<"point.1", PathSuggestions<WithReadonlyTuple>>(true);
      assertExtends<"point.2", PathSuggestions<WithReadonlyTuple>>(true);
      assertExtends<"point.3", PathSuggestions<WithReadonlyTuple>>(false);
    });

    // Optional tuple elements
    interface WithOptionalTuple {
      maybeTwo: [string, number?];
    }

    it("handles optional tuple elements", () => {
      assertExtends<"maybeTwo.0", PathSuggestions<WithOptionalTuple>>(true);
      assertExtends<"maybeTwo.1", PathSuggestions<WithOptionalTuple>>(true);
      assertExtends<"maybeTwo.2", PathSuggestions<WithOptionalTuple>>(false);
    });

    // Intersection types
    type Intersection = { a: string } & { b: number };

    it("handles intersection types", () => {
      assertExtends<"a", PathSuggestions<Intersection>>(true);
      assertExtends<"b", PathSuggestions<Intersection>>(true);
    });

    // Mapped types with literal keys
    type Mapped = { [K in "x" | "y" | "z"]: number };

    it("handles mapped types with literal keys", () => {
      assertExtends<"x", PathSuggestions<Mapped>>(true);
      assertExtends<"y", PathSuggestions<Mapped>>(true);
      assertExtends<"z", PathSuggestions<Mapped>>(true);
      assertExtends<"w", PathSuggestions<Mapped>>(false);
    });

    // Record type (equivalent to string index)
    type RecordType = { data: Record<string, { value: number }> };

    it("handles Record types (same as string index)", () => {
      assertExtends<"data.<string>", PathSuggestions<RecordType>>(true);
      assertExtends<"data.<string>.value", PathSuggestions<RecordType>>(true);
    });

    // Primitives should return never
    it("returns never for primitive types", () => {
      assertEqual<PathSuggestions<string>, never>(true);
      assertEqual<PathSuggestions<number>, never>(true);
      assertEqual<PathSuggestions<boolean>, never>(true);
    });

    // never type
    it("returns never for never type", () => {
      assertEqual<PathSuggestions<never>, never>(true);
    });

    // Symbol keys should be ignored
    interface WithSymbol {
      [Symbol.iterator]: () => void;
      name: string;
    }

    it("ignores symbol keys", () => {
      assertExtends<"name", PathSuggestions<WithSymbol>>(true);
      // Symbol keys can't be string paths anyway
    });
  });

  describe("union of index signature types", () => {
    // Union where branches have different index signatures
    type MixedIndexUnion =
      | { known: "hello"; [key: string]: string }
      | { "0": number; [key: number]: number };

    it("suggests paths from all union branches", () => {
      // From string-indexed branch: <string> placeholder
      assertExtends<"<string>", PathSuggestions<MixedIndexUnion>>(true);
      // From number-indexed branch: "0" placeholder and explicit "0" key
      assertExtends<"0", PathSuggestions<MixedIndexUnion>>(true);
    });

    it("does not suggest absorbed keys from string-indexed branch", () => {
      // "known" is absorbed by string index in first branch
      assertExtends<"known", PathSuggestions<MixedIndexUnion>>(false);
    });
  });

  describe("both string and number index signatures", () => {
    // Object with both string and number index signatures
    // Note: In TypeScript, you can't actually have both - string implies number
    // So this is really just testing string index behavior
    interface BothIndices {
      [key: string]: string;
      // [key: number]: string; // This would be redundant
    }

    it("only suggests <string> (number is implied)", () => {
      assertExtends<"<string>", PathSuggestions<BothIndices>>(true);
      assertExtends<"0", PathSuggestions<BothIndices>>(false);
    });
  });

  describe("PathSuggestions assignable to Path", () => {
    // Every PathSuggestion should be a valid Path
    // This ensures suggestions are always type-safe

    it("simple object suggestions are valid paths", () => {
      type Obj = { a: { b: string } };
      type Suggestions = PathSuggestions<Obj>;
      type Paths = Path<Obj>;
      // All suggestions should extend Path
      assertExtends<Suggestions, Paths>(true);
    });

    it("array suggestions are valid paths", () => {
      type Obj = { items: { id: number }[] };
      type Suggestions = PathSuggestions<Obj>;
      type Paths = Path<Obj>;
      assertExtends<Suggestions, Paths>(true);
    });

    it("tuple suggestions are valid paths", () => {
      type Obj = { point: [number, number, number] };
      type Suggestions = PathSuggestions<Obj>;
      type Paths = Path<Obj>;
      assertExtends<Suggestions, Paths>(true);
    });

    it("number index suggestions are valid paths", () => {
      type Obj = { scores: { [key: number]: number } };
      type Suggestions = PathSuggestions<Obj>;
      type Paths = Path<Obj>;
      // "scores.0" should be a valid path
      assertExtends<Suggestions, Paths>(true);
    });

    it("string index suggestions are valid paths", () => {
      type Obj = { data: { [key: string]: { value: number } } };
      type Suggestions = PathSuggestions<Obj>;
      type Paths = Path<Obj>;
      // "data.<string>" and "data.<string>.value" should be valid paths
      assertExtends<Suggestions, Paths>(true);
    });

    it("union type suggestions are valid paths", () => {
      type Obj = {
        status: { type: "a"; data: string } | { type: "b"; error: string };
      };
      type Suggestions = PathSuggestions<Obj>;
      type Paths = Path<Obj>;
      assertExtends<Suggestions, Paths>(true);
    });

    it("complex nested suggestions are valid paths", () => {
      type Suggestions = PathSuggestions<TestModel>;
      type Paths = Path<TestModel>;
      assertExtends<Suggestions, Paths>(true);
    });
  });
});

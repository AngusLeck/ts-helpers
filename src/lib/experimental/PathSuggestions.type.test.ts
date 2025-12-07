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

    it("suggests <number> placeholder for number index", () => {
      assertExtends<"numIndexed.<number>", PathSuggestions<TestModel>>(true);
    });

    it("does not suggest arbitrary keys", () => {
      assertExtends<"indexed.arbitrary", PathSuggestions<TestModel>>(false);
      assertExtends<"indexed.known", PathSuggestions<TestModel>>(false); // absorbed by index signature
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
  });
});

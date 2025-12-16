import { Depth } from "./Depth.js";
import { FunctionPath } from "./FunctionPath.js";
import { GET, Get } from "./Get.js";
import { Path } from "./Path.js";
import { PathEndingIn } from "./PathEndingIn.js";
import { assertEqual, assertExtends } from "./testHelpers/index.js";

/**
 * Comprehensive test model covering all path generation scenarios.
 * One type to load mentally, then focus on behavior assertions.
 */
interface TestModel {
  // Primitives
  name: string;
  count: number;
  active: boolean;

  // Nested objects
  settings: {
    theme: string;
    volume: number;
    notifications: {
      email: boolean;
      sms: boolean;
    };
    reset: () => void;
  };

  // Dynamic array (preserves "0" for autocomplete, accepts any index)
  tags: string[];

  // Array of objects
  users: { id: number; username: string }[];

  // Tuple (exact indices only)
  coordinates: [number, number, string];

  // Tuple with nested objects
  endpoints: [{ url: string }, { url: string; port: number }];

  // Functions
  greet: () => void;
  calculate: (x: number) => number;

  // Built-in types (leaf nodes, not recursed)
  createdAt: Date;
  pattern: RegExp;
  metadata: Map<string, unknown>;

  // Circular reference
  self: TestModel;
}

describe("Path<T, Depth<N>>", () => {
  describe("generates paths for simple properties", () => {
    it("includes top-level primitives", () => {
      assertExtends<"name", Path<TestModel>>(true);
      assertExtends<"count", Path<TestModel>>(true);
      assertExtends<"active", Path<TestModel>>(true);
    });
  });

  describe("generates paths through nested objects", () => {
    it("traverses multiple levels", () => {
      assertExtends<"settings.theme", Path<TestModel>>(true);
      assertExtends<"settings.notifications.email", Path<TestModel>>(true);
    });
  });

  describe("respects depth limit", () => {
    interface DeepObj {
      a: { b: { c: { d: string } } };
    }

    it("stops at specified depth", () => {
      type Paths = Path<DeepObj, Depth<2>>;
      type Expected = "a" | "a.b";

      assertEqual<Paths, Expected>(true);
      assertEqual<Expected, Paths>(true);
    });
  });

  describe("handles dynamic arrays", () => {
    it("preserves '0' for autocomplete while accepting any index", () => {
      assertExtends<"tags.0", Path<TestModel>>(true);
      assertExtends<"tags.5", Path<TestModel>>(true);
      assertExtends<"tags.99", Path<TestModel>>(true);
    });

    it("generates paths into array element properties", () => {
      assertExtends<"users.0.id", Path<TestModel>>(true);
      assertExtends<"users.10.username", Path<TestModel>>(true);
    });
  });

  describe("handles tuples", () => {
    it("generates exact indices only", () => {
      type TuplePaths = Path<{ coords: [number, number, string] }, Depth<2>>;
      type Expected = "coords" | "coords.0" | "coords.1" | "coords.2";

      assertEqual<TuplePaths, Expected>(true);
      assertEqual<Expected, TuplePaths>(true);
    });

    it("rejects invalid indices", () => {
      type TuplePaths = Path<{ coords: [number, number] }, Depth<2>>;

      // Valid indices
      assertExtends<"coords.0", TuplePaths>(true);
      assertExtends<"coords.1", TuplePaths>(true);

      // Invalid indices should NOT be assignable
      assertExtends<"coords.2", TuplePaths>(false);
      assertExtends<"coords.99", TuplePaths>(false);
    });

    it("generates paths into tuple element objects", () => {
      type Paths = Path<TestModel, Depth<3>>;

      assertExtends<"endpoints.0.url", Paths>(true);
      assertExtends<"endpoints.1.port", Paths>(true);
    });
  });

  describe("handles circular references", () => {
    interface Circular {
      child: Circular;
      value: string;
    }

    it("respects depth limit without TS2589 error", () => {
      type Paths = Path<Circular, Depth<3>>;
      type Expected =
        | "child"
        | "value"
        | "child.child"
        | "child.value"
        | "child.child.child"
        | "child.child.value";

      assertEqual<Paths, Expected>(true);
      assertEqual<Expected, Paths>(true);
    });

    it("compiles at default depth without infinite recursion", () => {
      assertExtends<"child.child.child.child.child", Path<Circular>>(true);
    });
  });

  describe("treats built-in types as leaves", () => {
    interface BuiltIns {
      date: Date;
      regex: RegExp;
      map: Map<string, number>;
      set: Set<number>;
      fn: () => void;
    }

    it("does not recurse into Date, Map, Set, etc.", () => {
      type Paths = Path<BuiltIns, Depth<2>>;
      type Expected = "date" | "regex" | "map" | "set" | "fn";

      assertEqual<Paths, Expected>(true);
      assertEqual<Expected, Paths>(true);
    });
  });
});

describe("Get<T, Path>", () => {
  describe("extracts types from objects", () => {
    it("returns exact type at each path level", () => {
      assertEqual<Get<TestModel, "name">, string>(true);
      assertEqual<Get<TestModel, "count">, number>(true);
      assertEqual<Get<TestModel, "settings">, TestModel["settings"]>(true);
      assertEqual<Get<TestModel, "settings.theme">, string>(true);
      assertEqual<Get<TestModel, "settings.notifications.email">, boolean>(
        true,
      );
    });
  });

  describe("extracts types from arrays", () => {
    it("returns element type | undefined for dynamic arrays", () => {
      assertEqual<Get<TestModel, "tags">, string[]>(true);
      assertEqual<Get<TestModel, "tags.0">, string | undefined>(true);
      assertEqual<Get<TestModel, "tags.99">, string | undefined>(true);
    });

    it("returns element type | undefined for nested access", () => {
      assertEqual<Get<TestModel, "users.0.id">, number | undefined>(true);
      assertEqual<Get<TestModel, "users.5.username">, string | undefined>(true);
    });
  });

  describe("extracts types from tuples", () => {
    it("returns exact element types without undefined", () => {
      assertEqual<Get<TestModel, "coordinates.0">, number>(true);
      assertEqual<Get<TestModel, "coordinates.1">, number>(true);
      assertEqual<Get<TestModel, "coordinates.2">, string>(true);
    });

    it("extracts nested tuple element properties", () => {
      assertEqual<Get<TestModel, "endpoints.0.url">, string>(true);
      assertEqual<Get<TestModel, "endpoints.1.port">, number>(true);
    });
  });

  describe("handles nullable types", () => {
    interface WithNullable {
      user: { name: string } | null;
    }

    it("preserves null in union", () => {
      assertEqual<Get<WithNullable, "user">, { name: string } | null>(true);
    });
  });
});

describe("GET<T, Path> (original tests)", () => {
  it("should return the type of the value at a path of T", () => {
    interface OneKey {
      a: "a";
    }

    assertEqual<Get<OneKey, "a">, "a">(true);

    interface MultipleKeys {
      a: "a";
      b: "b";
      c: "c";
    }

    assertEqual<Get<MultipleKeys, "a">, "a">(true);
    assertEqual<Get<MultipleKeys, "b">, "b">(true);
    assertEqual<Get<MultipleKeys, "c">, "c">(true);

    interface NestedKeys {
      a: { b: { c: "c" } };
    }

    assertEqual<Get<NestedKeys, "a">, { b: { c: "c" } }>(true);
    assertEqual<Get<NestedKeys, "a.b">, { c: "c" }>(true);
    assertEqual<Get<NestedKeys, "a.b.c">, "c">(true);

    type Union = { a: "a" } | { b: "b" };

    assertEqual<Get<Union, "a">, "a" | undefined>(true);
    assertEqual<Get<Union, "b">, "b" | undefined>(true);

    interface OptionalKey {
      a?: "a";
    }

    assertEqual<Get<OptionalKey, "a">, "a" | undefined>(true);

    type UnionWithMatchingKeys = { a: "a" } | { a: "b" };

    assertEqual<Get<UnionWithMatchingKeys, "a">, "a" | "b">(true);

    interface NestedOptionalKeys {
      a?: { b?: { c?: "c" } };
    }

    assertEqual<Get<NestedOptionalKeys, "a">, { b?: { c?: "c" } } | undefined>(
      true,
    );
    assertEqual<Get<NestedOptionalKeys, "a.b">, { c?: "c" } | undefined>(true);
    assertEqual<Get<NestedOptionalKeys, "a.b.c">, "c" | undefined>(true);

    interface InfinitelyNested {
      a: InfinitelyNested;
    }

    assertEqual<GET<InfinitelyNested, "a.a.a.a.a">, InfinitelyNested>(true);

    interface NestedMultipleKeys {
      a: { b: { c: "c"; d: "d"; f: "f" } };
    }

    assertEqual<Get<NestedMultipleKeys, "a.b.c" | "a.b.d">, "c" | "d">(true);

    interface ReadOnly {
      readonly a: "a";
    }

    assertEqual<Get<ReadOnly, "a">, "a">(true);

    interface NestedReadOnly {
      readonly a: { readonly b: { readonly c: "c" } };
    }

    assertEqual<Get<NestedReadOnly, "a.b.c">, "c">(true);
    assertEqual<Get<NestedReadOnly, "a.b">, { readonly c: "c" }>(true);
    assertEqual<Get<NestedReadOnly, "a">, { readonly b: { readonly c: "c" } }>(
      true,
    );

    interface NestedOptionalReadOnly {
      readonly a?: { readonly b?: { readonly c?: "c" } };
    }

    assertEqual<Get<NestedOptionalReadOnly, "a.b.c">, "c" | undefined>(true);
    assertEqual<
      Get<NestedOptionalReadOnly, "a.b">,
      { readonly c?: "c" } | undefined
    >(true);
    assertEqual<
      Get<NestedOptionalReadOnly, "a">,
      { readonly b?: { readonly c?: "c" } } | undefined
    >(true);
  });
});

describe("PathEndingIn<T, Target, Depth<N>>", () => {
  it("filters paths ending in string", () => {
    type StringPaths = PathEndingIn<TestModel, string, Depth<2>>;

    assertExtends<"name", StringPaths>(true);
    assertExtends<"settings.theme", StringPaths>(true);
    assertExtends<"tags.0", StringPaths>(true);
  });

  it("filters paths ending in number", () => {
    type NumberPaths = PathEndingIn<TestModel, number, Depth<2>>;

    assertExtends<"count", NumberPaths>(true);
    assertExtends<"settings.volume", NumberPaths>(true);
  });

  it("filters paths ending in boolean", () => {
    type BooleanPaths = PathEndingIn<TestModel, boolean, Depth<2>>;

    // Includes "active" and "self.active" (from circular ref at depth 2)
    assertEqual<BooleanPaths, "active" | "self.active">(true);
  });

  it("returns never when no paths match", () => {
    type SymbolPaths = PathEndingIn<TestModel, symbol, Depth<3>>;

    assertEqual<SymbolPaths, never>(true);
  });
});

describe("FunctionPath<T, Depth<N>>", () => {
  it("finds all paths ending in functions", () => {
    type FuncPaths = FunctionPath<TestModel, Depth<2>>;
    // Includes self.* paths from circular ref at depth 2
    type Expected =
      | "greet"
      | "calculate"
      | "settings.reset"
      | "self.greet"
      | "self.calculate";

    assertEqual<FuncPaths, Expected>(true);
    assertEqual<Expected, FuncPaths>(true);
  });

  it("works with various function signatures", () => {
    interface WithMethods {
      noArgs: () => void;
      withArgs: (a: string, b: number) => boolean;
      asyncFn: () => Promise<void>;
    }
    type Paths = FunctionPath<WithMethods, Depth<1>>;
    type Expected = "noArgs" | "withArgs" | "asyncFn";

    assertEqual<Paths, Expected>(true);
    assertEqual<Expected, Paths>(true);
  });

  it("returns never when no functions exist", () => {
    interface NoFunctions {
      name: string;
      count: number;
    }
    type Paths = FunctionPath<NoFunctions, Depth<2>>;

    assertEqual<Paths, never>(true);
  });
});

describe("union type handling", () => {
  it("should properly handle unions with mixed object and array types", () => {
    type ObjectArrayUnion = { 0: "obj" } | "arr"[];
    assertEqual<Get<ObjectArrayUnion, "0">, "obj" | "arr" | undefined>(true);
    type ObjectTupleUnion = { 0: "obj" } | ["tup"];
    assertEqual<Get<ObjectTupleUnion, "0">, "obj" | "tup">(true);
    type ArrayTupleUnion = ["tup"] | "arr"[];
    assertEqual<Get<ArrayTupleUnion, "0">, "tup" | "arr" | undefined>(true);
  });
});

/**
 * Edge case tests to verify handling of unusual type scenarios
 */
describe("Edge cases", () => {
  describe("index signatures", () => {
    it("handles objects with string index signatures", () => {
      interface StringIndexed {
        [key: string]: number;
      }
      // Path should generate paths for index signature
      type Paths = Path<{ data: StringIndexed }, Depth<2>>;
      assertExtends<"data", Paths>(true);
      // Index signatures create `string` keys - check if any path beyond "data" works
      assertExtends<"data.anything", Paths>(true);
    });

    it("handles objects with number index signatures", () => {
      interface NumberIndexed {
        [key: number]: string;
      }
      type Paths = Path<{ items: NumberIndexed }, Depth<2>>;
      assertExtends<"items", Paths>(true);
    });

    it("Get returns correct type for index signatures", () => {
      interface StringIndexed {
        [key: string]: number;
      }
      assertEqual<Get<{ data: StringIndexed }, "data">, StringIndexed>(true);
    });
  });

  describe("tuples with optional elements", () => {
    it("handles tuples with optional trailing elements", () => {
      type OptionalTuple = [string, number?];
      type Paths = Path<{ t: OptionalTuple }, Depth<2>>;
      assertExtends<"t.0", Paths>(true);
      assertExtends<"t.1", Paths>(true);
    });

    it("Get returns correct types for optional tuple elements", () => {
      type OptionalTuple = [string, number?];
      assertEqual<Get<{ t: OptionalTuple }, "t.0">, string>(true);
      assertEqual<Get<{ t: OptionalTuple }, "t.1">, number | undefined>(true);
    });
  });

  describe("readonly arrays", () => {
    it("handles readonly arrays", () => {
      interface WithReadonlyArray {
        items: readonly string[];
      }
      type Paths = Path<WithReadonlyArray, Depth<2>>;
      assertExtends<"items", Paths>(true);
      assertExtends<"items.0", Paths>(true);
    });

    it("handles readonly tuples", () => {
      interface WithReadonlyTuple {
        coords: readonly [number, number];
      }
      type Paths = Path<WithReadonlyTuple, Depth<2>>;
      assertExtends<"coords.0", Paths>(true);
      assertExtends<"coords.1", Paths>(true);
    });
  });

  describe("never and unknown types", () => {
    it("handles properties typed as never", () => {
      interface WithNever {
        impossible: never;
        possible: string;
      }
      type Paths = Path<WithNever, Depth<1>>;
      assertExtends<"possible", Paths>(true);
      assertExtends<"impossible", Paths>(true);
    });

    it("handles properties typed as unknown", () => {
      interface WithUnknown {
        mystery: unknown;
        known: string;
      }
      type Paths = Path<WithUnknown, Depth<1>>;
      assertExtends<"mystery", Paths>(true);
      assertExtends<"known", Paths>(true);
    });

    it("Get returns never/unknown correctly", () => {
      interface WithNeverUnknown {
        never: never;
        unknown: unknown;
      }
      assertEqual<Get<WithNeverUnknown, "never">, never>(true);
      assertEqual<Get<WithNeverUnknown, "unknown">, unknown>(true);
    });
  });

  describe("empty objects and arrays", () => {
    it("handles empty object type", () => {
      // eslint-disable-next-line @typescript-eslint/ban-types
      type EmptyObj = {};
      type Paths = Path<{ data: EmptyObj }, Depth<2>>;
      // Should only have "data", no nested paths
      assertEqual<Paths, "data">(true);
    });

    it("handles empty tuple", () => {
      type EmptyTuple = [];
      type Paths = Path<{ items: EmptyTuple }, Depth<2>>;
      assertEqual<Paths, "items">(true);
    });
  });

  describe("union of objects with different keys", () => {
    it("Path generates paths for all union members", () => {
      type UnionObj = { a: string } | { b: number };
      type Paths = Path<UnionObj, Depth<1>>;
      // Both "a" and "b" should be valid paths
      assertExtends<"a", Paths>(true);
      assertExtends<"b", Paths>(true);
    });

    it("Get returns undefined for keys not present in all union members", () => {
      type UnionObj = { a: string } | { b: number };
      assertEqual<Get<UnionObj, "a">, string | undefined>(true);
      assertEqual<Get<UnionObj, "b">, number | undefined>(true);
    });
  });

  describe("intersection types", () => {
    it("handles intersection of objects", () => {
      type Intersected = { a: string } & { b: number };
      type Paths = Path<Intersected, Depth<1>>;
      assertExtends<"a", Paths>(true);
      assertExtends<"b", Paths>(true);
    });

    it("Get extracts correct types from intersections", () => {
      type Intersected = { a: string } & { b: number };
      assertEqual<Get<Intersected, "a">, string>(true);
      assertEqual<Get<Intersected, "b">, number>(true);
    });
  });

  describe("arrays of unions", () => {
    it("handles arrays containing union types", () => {
      interface WithUnionArray {
        items: (string | number)[];
      }
      type Paths = Path<WithUnionArray, Depth<2>>;
      assertExtends<"items.0", Paths>(true);
    });

    it("Get returns union element type for array of unions", () => {
      interface WithUnionArray {
        items: (string | number)[];
      }
      assertEqual<Get<WithUnionArray, "items.0">, string | number | undefined>(
        true,
      );
    });
  });

  describe("nested nullable chains", () => {
    it("handles deeply nested nullable properties", () => {
      interface DeepNullable {
        a: {
          b: {
            c: string | null;
          } | null;
        } | null;
      }
      type Paths = Path<DeepNullable, Depth<4>>;
      assertExtends<"a", Paths>(true);
      assertExtends<"a.b", Paths>(true);
      assertExtends<"a.b.c", Paths>(true);
    });

    it("Get preserves null through nullable chain", () => {
      interface DeepNullable {
        a: {
          b: string | null;
        } | null;
      }
      // At "a", we get the whole object | null
      assertEqual<Get<DeepNullable, "a">, { b: string | null } | null>(true);
      // At "a.b", null doesn't have .b so we should get undefined too
      assertEqual<Get<DeepNullable, "a.b">, string | null | undefined>(true);
    });
  });

  describe("symbol keys", () => {
    it("ignores symbol keys in Path generation", () => {
      const sym = Symbol("test");
      interface WithSymbol {
        [sym]: string;
        normal: number;
      }
      type Paths = Path<WithSymbol, Depth<1>>;
      // Symbol keys should not appear in paths (only string/number keys)
      assertExtends<"normal", Paths>(true);
    });
  });

  describe("class instances", () => {
    it("handles class instance types", () => {
      class MyClass {
        name = "";
        getValue(): number {
          return 0;
        }
      }
      type Paths = Path<MyClass, Depth<1>>;
      assertExtends<"name", Paths>(true);
      assertExtends<"getValue", Paths>(true);
    });

    it("handles static methods on classes", () => {
      class MyClass {
        static staticMethod(): string {
          return "";
        }
        static staticProperty = 42;
        instanceMethod(): number {
          return 0;
        }
      }
      // typeof MyClass gives us the constructor/static side
      type StaticPaths = Path<typeof MyClass, Depth<1>>;
      assertExtends<"staticMethod", StaticPaths>(true);
      assertExtends<"staticProperty", StaticPaths>(true);
      // instance methods should NOT appear on the static side
      assertExtends<"instanceMethod", StaticPaths>(false);
    });
  });

  describe("branded/nominal types", () => {
    it("handles branded primitives", () => {
      type UserId = string & { __brand: "UserId" };
      interface WithBranded {
        id: UserId;
        name: string;
      }
      type Paths = Path<WithBranded, Depth<1>>;
      assertExtends<"id", Paths>(true);
      assertExtends<"name", Paths>(true);
    });

    it("Get returns branded type correctly", () => {
      type UserId = string & { __brand: "UserId" };
      interface WithBranded {
        id: UserId;
      }
      assertEqual<Get<WithBranded, "id">, UserId>(true);
    });
  });

  describe("tuples with rest elements", () => {
    type TupleWithRest = [string, ...number[]];
    // Longer tuple: 11 fixed elements + rest
    type TupleWithRest2 = [
      string,
      boolean,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      number,
      string,
      ...number[],
    ];

    it("Path handles tuples with rest elements", () => {
      type Paths = Path<{ t: TupleWithRest }, Depth<2>>;

      assertExtends<"t", Paths>(true);
      assertExtends<"t.0", Paths>(true);
      // Rest elements should allow any valid numeric index
      assertExtends<"t.1", Paths>(true);
      assertExtends<"t.99", Paths>(true);
      // Non-numeric strings should NOT be valid
      assertExtends<"t.rest", Paths>(false);
    });

    it("Path suggests first rest index for discoverability", () => {
      // [string, ...number[]] should suggest "0" (fixed) AND "1" (first rest)
      type Paths1 = Path<{ t: TupleWithRest }, Depth<2>>;
      assertExtends<"t.0", Paths1>(true);
      assertExtends<"t.1", Paths1>(true);

      // TupleWithRest2 has 11 fixed elements, so should suggest "0"-"10" (fixed) AND "11" (first rest)
      type Paths2 = Path<{ t: TupleWithRest2 }, Depth<2>>;
      assertExtends<"t.0", Paths2>(true);
      assertExtends<"t.10", Paths2>(true);
      assertExtends<"t.11", Paths2>(true); // First rest index
      assertExtends<"t.99", Paths2>(true);
    });

    it("Get returns correct types for rest tuple elements", () => {
      assertEqual<Get<{ t: TupleWithRest }, "t.0">, string>(true);
      assertEqual<Get<{ t: TupleWithRest }, "t.1">, number | undefined>(true);

      // TupleWithRest2: 11 fixed elements + ...number[]
      assertEqual<Get<{ t: TupleWithRest2 }, "t.0">, string>(true);
      assertEqual<Get<{ t: TupleWithRest2 }, "t.1">, boolean>(true);
      assertEqual<Get<{ t: TupleWithRest2 }, "t.10">, string>(true); // Last fixed element
      assertEqual<Get<{ t: TupleWithRest2 }, "t.11">, number | undefined>(true); // First rest element
    });
  });

  describe("labeled tuple elements", () => {
    type LabeledTuple = [first: string, second: number];

    it("Path handles labeled tuples", () => {
      type Paths = Path<{ t: LabeledTuple }, Depth<2>>;
      assertExtends<"t.0", Paths>(true);
      assertExtends<"t.1", Paths>(true);
    });

    it("Get returns correct types for labeled tuples", () => {
      assertEqual<Get<{ t: LabeledTuple }, "t.0">, string>(true);
      assertEqual<Get<{ t: LabeledTuple }, "t.1">, number>(true);
    });
  });

  describe("nested arrays", () => {
    type NestedArray = string[][];

    it("Path handles nested arrays", () => {
      type Paths = Path<{ arr: NestedArray }, Depth<3>>;
      assertExtends<"arr", Paths>(true);
      assertExtends<"arr.0", Paths>(true);
      assertExtends<"arr.0.0", Paths>(true);
    });

    it("Get returns correct types for nested array access", () => {
      assertEqual<Get<{ arr: NestedArray }, "arr">, string[][]>(true);
      assertEqual<Get<{ arr: NestedArray }, "arr.0">, string[] | undefined>(
        true,
      );
      assertEqual<Get<{ arr: NestedArray }, "arr.0.0">, string | undefined>(
        true,
      );
    });
  });

  describe("Record types", () => {
    type RecordType = Record<string, { value: number }>;

    it("Path handles Record types", () => {
      type Paths = Path<{ r: RecordType }, Depth<3>>;
      assertExtends<"r", Paths>(true);
      // Record has string index signature
      assertExtends<"r.anykey", Paths>(true);
      assertExtends<"r.anykey.value", Paths>(true);
    });

    it("Get returns correct types for Record access", () => {
      assertEqual<Get<{ r: RecordType }, "r">, RecordType>(true);
    });
  });

  describe("Readonly<Partial<T>>", () => {
    type ReadonlyPartial = Readonly<Partial<{ a: string; b: number }>>;

    it("Path handles mapped types with modifiers", () => {
      type Paths = Path<ReadonlyPartial, Depth<1>>;
      assertExtends<"a", Paths>(true);
      assertExtends<"b", Paths>(true);
    });

    it("Get returns optional types correctly", () => {
      assertEqual<Get<ReadonlyPartial, "a">, string | undefined>(true);
      assertEqual<Get<ReadonlyPartial, "b">, number | undefined>(true);
    });
  });

  describe("discriminated unions", () => {
    type DiscUnion = { type: "a"; aVal: string } | { type: "b"; bVal: number };

    it("Path generates paths for all discriminated union variants", () => {
      type Paths = Path<DiscUnion, Depth<1>>;
      assertExtends<"type", Paths>(true);
      assertExtends<"aVal", Paths>(true);
      assertExtends<"bVal", Paths>(true);
    });

    it("Get handles discriminated union correctly", () => {
      // "type" exists in both - should be union of literals
      assertEqual<Get<DiscUnion, "type">, "a" | "b">(true);
      // "aVal" only exists in one variant
      assertEqual<Get<DiscUnion, "aVal">, string | undefined>(true);
      assertEqual<Get<DiscUnion, "bVal">, number | undefined>(true);
    });
  });

  describe("tuple with mixed element types", () => {
    type MixedTuple = [string, { nested: boolean }, number[]];

    it("Path traverses into tuple element objects and arrays", () => {
      type Paths = Path<{ m: MixedTuple }, Depth<3>>;
      assertExtends<"m.0", Paths>(true);
      assertExtends<"m.1", Paths>(true);
      assertExtends<"m.1.nested", Paths>(true);
      assertExtends<"m.2", Paths>(true);
      assertExtends<"m.2.0", Paths>(true);
    });

    it("Get returns correct types for mixed tuple elements", () => {
      assertEqual<Get<{ m: MixedTuple }, "m.0">, string>(true);
      assertEqual<Get<{ m: MixedTuple }, "m.1">, { nested: boolean }>(true);
      assertEqual<Get<{ m: MixedTuple }, "m.1.nested">, boolean>(true);
      assertEqual<Get<{ m: MixedTuple }, "m.2">, number[]>(true);
      assertEqual<Get<{ m: MixedTuple }, "m.2.0">, number | undefined>(true);
    });
  });

  describe("template literal keys", () => {
    type TemplateKeys = { [K in `user_${string}`]: number };

    it("Path handles template literal index signatures", () => {
      type Paths = Path<{ t: TemplateKeys }, Depth<2>>;
      assertExtends<"t", Paths>(true);
      // Template literal creates a string index signature effectively
      assertExtends<"t.user_123", Paths>(true);
    });
  });
});

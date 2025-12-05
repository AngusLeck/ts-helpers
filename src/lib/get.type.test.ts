import { assertEqual, assertExtends } from "./testHelpers";
import { GET, Get } from "./Get";
import { Path, Depth } from "./Path";
import { PathEndingIn } from "./PathEndingIn";
import { FunctionPath } from "./FunctionPath";

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

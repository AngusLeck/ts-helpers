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

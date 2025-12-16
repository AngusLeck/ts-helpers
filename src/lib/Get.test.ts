import { get } from "./Get.js";

describe("get", () => {
  it("should return the type of the value at a path of T", () => {
    interface OneKey {
      a: "a";
    }

    const oneKey: OneKey = { a: "a" };

    expect(get(oneKey, "a")).toEqual("a");

    interface MultipleKeys {
      a: "a";
      b: "b";
      c: "c";
    }

    const multipleKeys: MultipleKeys = { a: "a", b: "b", c: "c" };

    expect(get(multipleKeys, "a")).toEqual("a");
    expect(get(multipleKeys, "b")).toEqual("b");
    expect(get(multipleKeys, "c")).toEqual("c");

    interface NestedKeys {
      a: { b: { c: "c" } };
    }

    const nestedKeys: NestedKeys = { a: { b: { c: "c" } } };

    expect(get(nestedKeys, "a")).toEqual({ b: { c: "c" } });
    expect(get(nestedKeys, "a.b")).toEqual({ c: "c" });
    expect(get(nestedKeys, "a.b.c")).toEqual("c");

    type Union = { a: "a" } | { b: "b" };

    const union1 = { a: "a" } as Union;
    const union2 = { b: "b" } as Union;

    expect(get(union1, "a")).toEqual("a");
    expect(get(union1, "b")).toEqual(undefined);
    expect(get(union2, "b")).toEqual("b");
    expect(get(union2, "a")).toEqual(undefined);

    interface OptionalKey {
      a?: "a";
    }

    const optionalKey1: OptionalKey = {};
    const optionalKey2: OptionalKey = { a: "a" };

    expect(get(optionalKey1, "a")).toEqual(undefined);
    expect(get(optionalKey2, "a")).toEqual("a");

    type UnionWithMatchingKeys = { a: "a" } | { a: "b" };

    const unionWithMatchingKeys1 = { a: "a" } as UnionWithMatchingKeys;
    const unionWithMatchingKeys2 = { a: "b" } as UnionWithMatchingKeys;

    expect(get(unionWithMatchingKeys1, "a")).toEqual("a");
    expect(get(unionWithMatchingKeys2, "a")).toEqual("b");

    interface NestedOptionalKeys {
      a?: { b?: { c?: "c" } };
    }

    const nestedOptionalKeys1: NestedOptionalKeys = {};
    const nestedOptionalKeys2: NestedOptionalKeys = { a: {} };
    const nestedOptionalKeys3: NestedOptionalKeys = { a: { b: {} } };
    const nestedOptionalKeys4: NestedOptionalKeys = { a: { b: { c: "c" } } };

    expect(get(nestedOptionalKeys1, "a")).toEqual(undefined);
    expect(get(nestedOptionalKeys2, "a")).toEqual({});
    expect(get(nestedOptionalKeys2, "a.b")).toEqual(undefined);
    expect(get(nestedOptionalKeys3, "a")).toEqual({ b: {} });
    expect(get(nestedOptionalKeys3, "a.b")).toEqual({});
    expect(get(nestedOptionalKeys3, "a.b.c")).toEqual(undefined);
    expect(get(nestedOptionalKeys4, "a")).toEqual({ b: { c: "c" } });
    expect(get(nestedOptionalKeys4, "a.b")).toEqual({ c: "c" });
    expect(get(nestedOptionalKeys4, "a.b.c")).toEqual("c");

    interface NestedMultipleKeys {
      a: { b: { c: "c"; d: "d"; f: "f" } };
    }

    const nestedMultipleKeys: NestedMultipleKeys = {
      a: { b: { c: "c", d: "d", f: "f" } },
    };

    expect(get(nestedMultipleKeys, "a")).toEqual({
      b: { c: "c", d: "d", f: "f" },
    });
    expect(get(nestedMultipleKeys, "a.b")).toEqual({ c: "c", d: "d", f: "f" });
    expect(get(nestedMultipleKeys, "a.b.c")).toEqual("c");
    expect(get(nestedMultipleKeys, "a.b.d")).toEqual("d");
    expect(get(nestedMultipleKeys, "a.b.f")).toEqual("f");

    interface ReadOnly {
      readonly a: "a";
    }

    const readOnly: ReadOnly = { a: "a" };

    expect(get(readOnly, "a")).toEqual("a");
  });

  describe("array and numeric key handling", () => {
    it("should handle array element access", () => {
      const arrayObj = { items: ["a", "b", "c"] };

      expect(get(arrayObj, "items.0")).toEqual("a");
      expect(get(arrayObj, "items.1")).toEqual("b");
      expect(get(arrayObj, "items.2")).toEqual("c");
    });

    it("should return undefined for out-of-bounds array access", () => {
      const arrayObj = { items: ["a", "b"] };

      expect(get(arrayObj, "items.5")).toEqual(undefined);
    });

    it("should handle nested array access", () => {
      const nestedArrayObj = { users: [{ name: "Alice" }, { name: "Bob" }] };

      expect(get(nestedArrayObj, "users.0.name")).toEqual("Alice");
      expect(get(nestedArrayObj, "users.1.name")).toEqual("Bob");
    });

    it("should return undefined for missing nested array elements", () => {
      const nestedArrayObj = { users: [{ name: "Alice" }] };

      expect(get(nestedArrayObj, "users.1.name")).toEqual(undefined);
    });

    it("should handle tuple access", () => {
      const tupleObj = { coords: [10, 20] as const };

      expect(get(tupleObj, "coords.0")).toEqual(10);
      expect(get(tupleObj, "coords.1")).toEqual(20);
    });

    it("should distinguish between object numeric keys and array indices", () => {
      const mixedObj = {
        obj: { "0": "zero", "3": "three" },
        arr: ["a", "b", "c", "d"],
      };

      expect(get(mixedObj, "obj.0")).toEqual("zero");
      expect(get(mixedObj, "obj.3")).toEqual("three");
      expect(get(mixedObj, "arr.0")).toEqual("a");
      expect(get(mixedObj, "arr.3")).toEqual("d");
    });

    it("should return undefined for missing numeric object keys", () => {
      const numericKeyObj = { obj: { "0": "zero", "2": "two" } };

      expect(get(numericKeyObj, "obj.0")).toEqual("zero");
      // @ts-expect-error intentional invalid path
      expect(get(numericKeyObj, "obj.1")).toEqual(undefined);
      expect(get(numericKeyObj, "obj.2")).toEqual("two");
    });

    it("should handle mixed object and array paths", () => {
      const complexObj = { data: { items: ["x", "y", "z"] } };

      expect(get(complexObj, "data.items.0")).toEqual("x");
      expect(get(complexObj, "data.items.2")).toEqual("z");
    });

    it("should handle complex nested structures", () => {
      const complexNested: {
        users: Array<{
          profile: { name: string; scores: number[] };
          "0": string;
          metadata?: { "3": string };
        }>;
        config: {
          "2": { enabled: boolean };
          settings: string[];
        };
      } = {
        users: [
          {
            profile: { name: "Alice", scores: [85, 92, 78] },
            "0": "user-zero-prop", // numeric key on user object
          },
          {
            profile: { name: "Bob", scores: [90, 88] },
            "0": "bob-zero-prop",
            metadata: { "3": "meta-three" }, // nested numeric key
          },
        ],
        config: {
          "2": { enabled: true }, // numeric key with object value
          settings: ["opt1", "opt2", "opt3"],
        },
      };

      // Access nested arrays within objects
      expect(get(complexNested, "users.0.profile.name")).toEqual("Alice");
      expect(get(complexNested, "users.0.profile.scores.1")).toEqual(92);
      expect(get(complexNested, "users.1.profile.scores.0")).toEqual(90);

      // Access numeric object keys in nested structures
      expect(get(complexNested, "users.0.0")).toEqual("user-zero-prop");
      expect(get(complexNested, "users.1.0")).toEqual("bob-zero-prop");
      expect(get(complexNested, "users.1.metadata.3")).toEqual("meta-three");
      expect(get(complexNested, "config.2.enabled")).toEqual(true);

      // Mix numeric keys and array indices
      expect(get(complexNested, "config.settings.2")).toEqual("opt3");
    });
  });
});

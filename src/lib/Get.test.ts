import { get } from "./Get";

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
});

import { assertEqual } from "./testHelpers";
import { GET, Get } from "./Get";

describe("Get", () => {
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
      true
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
      true
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

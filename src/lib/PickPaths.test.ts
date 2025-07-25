import { assertEqual } from "./testHelpers";
import { PickPaths } from "./PickPaths";

describe("PickPaths", () => {
  it("should pick specified paths and create nested object structure", () => {
    interface User {
      id: number;
      profile: {
        name: string;
        email: string;
        address: {
          street: string;
          city: string;
        };
      };
      settings: {
        theme: string;
        notifications: boolean;
      };
    }

    // Test single flat path
    assertEqual<PickPaths<User, "id">, { id: number }>(true);

    // Test single nested path
    assertEqual<PickPaths<User, "profile.name">, { profile: { name: string } }>(
      true
    );

    // Test mixed flat and nested paths
    assertEqual<
      PickPaths<User, "id" | "profile.email">,
      { id: number; profile: { email: string } }
    >(true);

    // Test multiple nested paths in same object
    assertEqual<
      PickPaths<User, "profile.name" | "profile.email">,
      { profile: { name: string; email: string } }
    >(true);

    // Test deeply nested paths
    assertEqual<
      PickPaths<User, "profile.address.city">,
      { profile: { address: { city: string } } }
    >(true);

    // Test paths from different top-level objects
    assertEqual<
      PickPaths<User, "profile.name" | "settings.theme">,
      { profile: { name: string }; settings: { theme: string } }
    >(true);
  });

  it("should work with simple union types", () => {
    type SimpleUnion = { a: "a" } | { b: "b" };

    assertEqual<PickPaths<SimpleUnion, "a">, { a: "a" | undefined }>(true);

    assertEqual<PickPaths<SimpleUnion, "b">, { b: "b" | undefined }>(true);

    // Union with overlapping keys
    type OverlapUnion = { a: "a"; c: "c1" } | { a: "b"; c: "c2" };

    assertEqual<PickPaths<OverlapUnion, "a">, { a: "a" | "b" }>(true);

    assertEqual<PickPaths<OverlapUnion, "c">, { c: "c1" | "c2" }>(true);

    assertEqual<
      PickPaths<OverlapUnion, "a" | "c">,
      { a: "a" | "b"; c: "c1" | "c2" }
    >(true);
  });

  it("should work with simple optional properties", () => {
    interface SimpleOptional {
      a?: string;
      b: number;
    }

    // Test required property
    assertEqual<PickPaths<SimpleOptional, "b">, { b: number }>(true);

    // Test optional property
    assertEqual<PickPaths<SimpleOptional, "a">, { a: string | undefined }>(
      true
    );

    // Test mixed
    assertEqual<
      PickPaths<SimpleOptional, "a" | "b">,
      { a: string | undefined; b: number }
    >(true);
  });

  it("should work with nested unions", () => {
    interface NestedUnion {
      data: {
        content:
          | { type: "text"; value: string }
          | { type: "number"; value: number };
      };
    }

    // Test accessing shared property in union
    assertEqual<
      PickPaths<NestedUnion, "data.content.type">,
      { data: { content: { type: "text" | "number" } } }
    >(true);

    // Test accessing union property
    assertEqual<
      PickPaths<NestedUnion, "data.content.value">,
      { data: { content: { value: string | number } } }
    >(true);
  });

  it("should work with array indices", () => {
    interface ArrayContainer {
      items: [string, number, boolean];
      nested: {
        values: [{ id: number }, { name: string }];
      };
    }

    assertEqual<PickPaths<ArrayContainer, "items.0">, { items: { 0: string } }>(
      true
    );

    assertEqual<
      PickPaths<ArrayContainer, "nested.values.1.name">,
      { nested: { values: { 1: { name: string } } } }
    >(true);

    assertEqual<
      PickPaths<ArrayContainer, "items.0" | "nested.values.1.name">,
      {
        items: { 0: string };
        nested: { values: { 1: { name: string } } };
      }
    >(true);
  });
});

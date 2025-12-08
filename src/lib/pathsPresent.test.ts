import { Path } from "./Path";
import { assertAllPresent, pathsPresent } from "./PathsPresent";

const testScenarios = [
  {
    description: "All single-level paths are present",
    input: { a: 1, b: 2 },
    paths: ["a", "b"],
    expectedResult: true,
  },
  {
    description: "One single-level path is absent",
    input: { a: 1, b: 2 },
    paths: ["a", "c"],
    expectedResult: false,
  },
  {
    description: "Multiple nested paths are present",
    input: { a: { x: 10 }, b: { y: { z: 15 } } },
    paths: ["a.x", "b.y.z"],
    expectedResult: true,
  },
  {
    description: "One nested path is absent",
    input: { a: { x: 10 }, b: { y: 20 } },
    paths: ["a.x", "b.y.z"],
    expectedResult: false,
  },
  {
    description: "Empty paths array",
    input: { a: 1, b: 2 },
    paths: [],
    expectedResult: true,
  },
  {
    description: "Path present but with undefined value",
    input: { a: undefined, b: 2 },
    paths: ["a"],
    expectedResult: false,
  },
  {
    description: "Complex nested structure with all paths present",
    input: { a: { b: { c: { d: { e: 5 } } } } },
    paths: ["a.b", "a.b.c", "a.b.c.d", "a.b.c.d.e"],
    expectedResult: true,
  },
  {
    description: "Complex nested structure with one path absent",
    input: { a: { b: { c: {} } } },
    paths: ["a.b", "a.b.c", "a.b.c.d"],
    expectedResult: false,
  },
  {
    description: "Input object is an empty object",
    input: {},
    paths: ["a"],
    expectedResult: false,
  },
  {
    description: "Input object is complex but path array is empty",
    input: { a: { b: { c: { d: { e: 5 } } } } },
    paths: [],
    expectedResult: true,
  },
  // Array and tuple tests
  {
    description: "Array element path is present",
    input: { items: ["a", "b", "c"] },
    paths: ["items.0", "items.1"],
    expectedResult: true,
  },
  {
    description: "Array element path is absent (index out of bounds)",
    input: { items: ["a", "b"] },
    paths: ["items.0", "items.5"],
    expectedResult: false,
  },
  {
    description: "Nested array access",
    input: { users: [{ name: "Alice" }, { name: "Bob" }] },
    paths: ["users.0.name", "users.1.name"],
    expectedResult: true,
  },
  {
    description: "Nested array access with missing element",
    input: { users: [{ name: "Alice" }] },
    paths: ["users.0.name", "users.1.name"],
    expectedResult: false,
  },
  {
    description: "Tuple access with valid indices",
    input: { coords: [10, 20] as const },
    paths: ["coords.0", "coords.1"],
    expectedResult: true,
  },
  {
    description: "Mixed object and array paths",
    input: { data: { items: ["x", "y", "z"] } },
    paths: ["data.items.0", "data.items.2"],
    expectedResult: true,
  },
  {
    description: "Object with numeric string keys vs array indices",
    input: {
      obj: { "0": "zero", "3": "three" },
      arr: ["a", "b", "c", "d"],
    },
    paths: ["obj.0", "obj.3", "arr.0", "arr.3"],
    expectedResult: true,
  },
  {
    description: "Numeric string key that doesn't exist in object",
    input: { obj: { "0": "zero", "2": "two" } },
    paths: ["obj.0", "obj.1"], // obj.1 doesn't exist
    expectedResult: false,
  },
  {
    description: "Complex nested structure with mixed array and object paths",
    input: {
      users: [
        {
          profile: { name: "Alice", scores: [85, 92, 78] },
          "0": "user-zero-prop",
        },
        {
          profile: { name: "Bob", scores: [90, 88] },
          metadata: { "3": "meta-three" },
        },
      ],
      config: {
        "2": { enabled: true },
        settings: ["opt1", "opt2", "opt3"],
      },
    },
    paths: [
      "users.0.profile.name",
      "users.0.profile.scores.1",
      "users.0.0", // numeric key
      "users.1.metadata.3", // nested numeric key
      "config.2.enabled", // numeric key with nested prop
      "config.settings.2", // array index in object
    ],
    expectedResult: true,
  },
];

describe("pathsPresent", () => {
  it.each(testScenarios)("$description", ({ input, paths, expectedResult }) => {
    expect(pathsPresent(input, ...(paths as Path<typeof input>[]))).toBe(
      expectedResult,
    );
  });
});

test("error message", () => {
  const input = { a: { b: { c: {} } } };
  const paths = ["a.b", "a.b.c", "a.b.c.d", "hello.yo"];

  expect(() =>
    assertAllPresent(input, ...(paths as Path<typeof input>[])),
  ).toThrowErrorMatchingInlineSnapshot(
    `"Some required paths missing from {\\"a\\":{\\"b\\":{\\"c\\":{}}}}, absent paths: a.b.c.d,hello.yo"`,
  );
});

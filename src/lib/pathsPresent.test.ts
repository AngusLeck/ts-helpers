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
];

describe("pathsPresent", () => {
  it.each(testScenarios)("$description", ({ input, paths, expectedResult }) => {
    expect(pathsPresent(input, ...(paths as Path<typeof input>[]))).toBe(
      expectedResult
    );
  });
});

test("error message", () => {
  const input = { a: { b: { c: {} } } };
  const paths = ["a.b", "a.b.c", "a.b.c.d", "hello.yo"];

  expect(() =>
    assertAllPresent(input, ...(paths as Path<typeof input>[]))
  ).toThrowErrorMatchingInlineSnapshot(
    `"Some required paths missing from {\\"a\\":{\\"b\\":{\\"c\\":{}}}}, absent paths: a.b.c.d,hello.yo"`
  );
});

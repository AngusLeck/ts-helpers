import { validatePath } from "./validatePath";

const isNumber = (val: unknown): val is number => typeof val === "number";

const isString = (val: unknown): val is string => typeof val === "string";

test("Should return true for a simple path and a satisfied guard condition", () => {
  const input: TestType1 = { name: "John", age: 30 };
  expect(validatePath(input, "age", isNumber)).toBe(true);
});

test("Should return false for a simple path and an unsatisfied guard condition", () => {
  const input: TestType1 = { name: "Jane", age: "18" };
  expect(validatePath(input, "age", isNumber)).toBe(false);
});

test("Should return true for a nested object path and a satisfied guard condition", () => {
  const input: TestType2 = {
    user: { name: "Jake", details: { age: 25, city: "New York" } },
  };
  expect(validatePath(input, "user.details.age", isNumber)).toBe(true);
});

test("Should return true for complex guard logic that is satisfied", () => {
  const input: TestType3 = { data: { count: 5, valid: true } };

  const objectValidator = (
    val: TestType3["data"]
  ): val is { count: number; valid: true } =>
    typeof val === "object" &&
    typeof val.count === "number" &&
    0 < val.count &&
    val.valid === true;

  expect(validatePath(input, "data", objectValidator)).toBe(true);
});

test("Should handle paths leading to undefined values correctly", () => {
  const input: TestType4 = { exists: { someProperty: "value" } };
  expect(validatePath(input, "doesNotExist.someProperty", isString)).toBe(
    false
  );
});

test("Should correctly type-guard when guard checks for a specific object structure", () => {
  const input: TestType5 = { nested: { score: 10, passed: true } };

  const objectValidator = <V>(val: V): val is V & { passed: true } =>
    val != null &&
    typeof val === "object" &&
    "passed" in val &&
    val["passed" as keyof typeof val] === true;

  expect(validatePath(input, "nested", objectValidator)).toBe(true);
});

interface TestType1 {
  name: string;
  age: number | string;
}

interface TestType2 {
  user: {
    name: string;
    details: {
      age: number | string;
      city: string;
    };
  };
}

interface TestType3 {
  data:
    | {
        count: number | string;
        valid: boolean;
      }
    | {
        count: string;
        valid: false;
      }
    | string;
}

type TestType4 =
  | {
      exists?: {
        someProperty: string;
      };
    }
  | {
      exists: {
        someProperty: string;
      };
      doesNotExist?: {
        someProperty: string;
      };
    };

interface TestType5 {
  nested?:
    | {
        score: string | number;
        passed: boolean;
      }
    | {
        nested: {
          somethingElse: string;
        };
      }
    | null;
}

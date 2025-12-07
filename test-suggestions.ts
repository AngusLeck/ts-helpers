import { Path, Get, get } from './src/index';

// Test type suggestions and autocomplete
type TestObj = {
  'type_name': "Test"
  user: {
    profile: {
      name: string;
      age: number;
    };
    settings: {
      theme: 'dark' | 'light';
    };
  };
  items: TestObj[];
  tags: readonly ['tag1', 'tag2', 'tag3'];
};

// Test 1: Path suggestions - should show all valid paths
type TestPaths = Path<TestObj>;
//   ^? Should show: "user" | "user.profile" | "user.profile.name" | "user.profile.age" | 
//      "user.settings" | "user.settings.theme" | "items" | "items.0" | "tags" | "tags.0" | "tags.1" | "tags.2"

// Test 2: Array vs Tuple handling
type ArrayPaths = Path<{ arr: string[]; tuple: [number, string] }>;
//   ^? Should show: "arr" | "arr.0" | "tuple" | "tuple.0" | "tuple.1" (NOT "tuple.2")

// Test 3: Depth control
type DeepObj = { a: { b: { c: { d: { e: string } } } } };
type ShallowPaths = Path<DeepObj, [0, 0]>; // Depth 2
//   ^? Should show: "a" | "a.b" (stops at depth 2)

// Test 4: Performance with deep nesting
type VeryDeepObj = { a: { b: { c: { d: { e: { f: { g: string } } } } } } };
type VeryDeepPaths = Path<VeryDeepObj>; // Should handle depth 5 default gracefully

// Test 5: Get type accuracy
type UserName = Get<TestObj, "user.profile.name">; // should be string
type ItemElement = Get<TestObj, "items.0">; // should be string | undefined
type Tag1 = Get<TestObj, "tags.0">; // should be "tag1"

// Test the actual function for autocomplete
const obj: TestObj = {} as any;
const name = get(obj, "items.0.items.100.user");
//                    ^? Cursor here should show all valid paths
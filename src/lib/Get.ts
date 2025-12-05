import { Path } from "./Path";

/**
 * Splits a dot-notation path into a tuple of keys.
 * "a.b.c" -> ["a", "b", "c"]
 */
type SplitPath<P extends string> = P extends `${infer Head}.${infer Rest}`
  ? [Head, ...SplitPath<Rest>]
  : [P];

/**
 * Internal helper to get value type at a key, handling optional properties.
 * Array element access always includes undefined since the element may not exist.
 */
type GetKeyInternal<T, K extends string> = K extends keyof T
  ? T[K]
  : T extends readonly unknown[]
    ? K extends `${number}`
      ? T[number] | undefined
      : undefined
    : undefined;

/**
 * Recursively traverses an object type following a path tuple.
 * Uses distributive conditional to handle union types properly.
 */
type GetByPathTuple<T, Parts extends string[]> = T extends unknown
  ? Parts extends [infer Head extends string, ...infer Rest extends string[]]
    ? GetByPathTuple<GetKeyInternal<T, Head>, Rest>
    : T
  : never;

/**
 * Like Get returns the type of the value at a path of T.
 * However it does not require P to be a path of T, and will return undefined if not.
 * The advantage is less strain on the ts server,
 * in particular Get cannot handle infinitely nested objects but GET can.
 *
 * ```
 * interface Doctor {
 *   9: { Actor: "Christopher" };
 *   10: { Actor: "David" };
 *   11: { Actor: "Matt" };
 *   12: { Actor: "Peter" };
 *   13: { Actor: "Jodie" };
 * }
 *
 * type David = GET<Doctor, "10.Actor">; // "David"
 * ```
 */
type GET<T, P extends string> = GetByPathTuple<T, SplitPath<P>>;

/**
 * Returns the type of the value at a path of T.
 * If the type is ambiguous returns a union.
 * If the object might not have the path, the union type will include undefined.
 * (This handles nullable graphql types)
 *
 * @typeParam T - The object type
 * @typeParam P - The dot-notation path string
 *
 * @example
 * ```
 * interface Doctor {
 *   9: { Actor: "Christopher" };
 *   10: { Actor: "David" };
 *   11: { Actor: "Matt" };
 *   12: { Actor: "Peter" };
 *   13: { Actor: "Jodie" };
 * }
 *
 * type David = Get<Doctor, "10.Actor">; // "David"
 * ```
 *
 * @example
 * ```
 * type Obj = { user: { name: string } };
 * type Name = Get<Obj, "user.name">; // string
 * ```
 */
type Get<T, P extends Path<T>> = GET<T, P>;

/**
 *
 * @param obj object to access
 * @param path path to access in the object (e.g. `"a.b.c"`)
 * @returns value at the path `Get<typeof obj, typeof path>`

 * ```
 * const doctor =  {
 *   9: { Actor: "Christopher" },
 *   10: { Actor: "David" },
 *   11: { Actor: "Matt" },
 *   12: { Actor: "Peter" },
 *   13: { Actor: "Jodie" },
 * } as const;
 *
 * const david = get(doctor, "10.Actor"); // "David"
 * ```
 */
function get<T, P extends Path<T> & string>(obj: T, path: P): Get<T, P> {
  const parts = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = obj;
  for (const part of parts) {
    current = current?.[part];
  }
  return current;
}

export { Get, GET, GetByPathTuple, SplitPath, get };

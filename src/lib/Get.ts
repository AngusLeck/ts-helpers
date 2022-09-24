import { Path } from "./Path";

/**
 * Can't simply use T[K] because if T is a union type, then K may not be a key,
 * when really we want to just treat it as an optional key.
 */
type GetKey<T, K extends string | number> = T extends {
  [k in K]: infer V;
}
  ? V
  : T extends {
      [k in K]?: infer V;
    }
  ? V | undefined
  : undefined;

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
 * type David = Get<Doctor, "10.Actor">; // "David"
 * ```
 */
type GET<T, P extends string> = P extends `${infer K}.${infer R}`
  ? GET<GetKey<T, K>, R>
  : GetKey<T, P>;

/**
 * Returns the type of the value at a path of T.
 * If the type is ambiguous returns a union.
 * If the object might not have the path, the union type will include undefined.
 * (This handles nullable graphql types)
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
 * type David = Get<Doctor, "10.Actor">; // "David"
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
function get<T, P extends Path<T>>(obj: T, path: P): Get<T, P> {
  const parts = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = obj;
  for (const part of parts) {
    current = current?.[part];
  }
  return current;
}

export { Get, GET, get };

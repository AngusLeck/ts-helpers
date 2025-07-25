import { Get } from "./Get";
import { Path } from "./Path";
import { UnionToIntersection } from "./UnionToIntersection";
import { Collapse } from "./Collapse";

/**
 * Helper type to build nested object structure from a single path
 */
type BuildPath<P extends string, T> = P extends `${infer K}.${infer Rest}`
  ? { [Key in K]: BuildPath<Rest, T> }
  : { [Key in P]: T };

/**
 * Like Pick but for object paths instead of keys.
 * Picks only the specified dot-separated paths from an object type
 * and reconstructs the nested object structure.
 *
 * ```typescript
 * interface User {
 *   profile: {
 *     name: string;
 *     email: string;
 *   };
 *   settings: {
 *     theme: string;
 *     notifications: boolean;
 *   };
 * }
 *
 * type UserBasics = PickPaths<User, "profile.name" | "settings.theme">;
 * // Result: {
 * //   profile: { name: string };
 * //   settings: { theme: string };
 * // }
 * ```
 */
type PickPaths<T, P extends Path<T>> = Collapse<
  UnionToIntersection<P extends string ? BuildPath<P, Get<T, P>> : never>
>;

export { PickPaths };

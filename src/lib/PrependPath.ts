import { ToString } from "./ToString.js";

/** Prepend a path to a key */
export type PrependPath<Path extends string, Key> = Path extends ""
  ? ToString<Key>
  : `${Path}.${ToString<Key>}`;
